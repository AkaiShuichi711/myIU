package com.myiu.portal.config;

import com.github.benmanes.caffeine.cache.Cache;
import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.ConsumptionProbe;
import com.myiu.portal.util.IpUtils;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Duration;
import java.util.concurrent.TimeUnit;

/**
 * Token-bucket rate limiting (Bucket4j).
 *
 * Token-bucket is the algorithm used by AWS API Gateway, Stripe, Shopify.
 * Each client gets N tokens. Each request consumes 1. Tokens refill over time.
 * If the bucket is empty → 429 Too Many Requests.
 *
 * O(1) per request — just an atomic CAS on the bucket counter.
 * No lock contention; safe for high-concurrency virtual threads.
 */
@Component
@Order(1)
@RequiredArgsConstructor
public class RateLimitFilter extends OncePerRequestFilter {

    private final Cache<String, Bucket> rateLimitBuckets;

    // 5 login attempts / minute / IP — brute-force protection
    private static final Bandwidth LOGIN_LIMIT =
            Bandwidth.builder().capacity(5).refillIntervally(5, Duration.ofMinutes(1)).build();

    // 60 search requests / minute / user — prevents data scraping
    private static final Bandwidth SEARCH_LIMIT =
            Bandwidth.builder().capacity(60).refillGreedy(60, Duration.ofMinutes(1)).build();

    // 10 uploads / hour / user — storage flood protection
    private static final Bandwidth UPLOAD_LIMIT =
            Bandwidth.builder().capacity(10).refillIntervally(10, Duration.ofHours(1)).build();

    // 120 general API requests / minute / IP — general DDoS buffer
    private static final Bandwidth GENERAL_LIMIT =
            Bandwidth.builder().capacity(120).refillGreedy(120, Duration.ofMinutes(1)).build();

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain) throws ServletException, IOException {
        String path = request.getRequestURI();
        Bandwidth bandwidth = resolveBandwidth(path, request.getMethod());

        if (bandwidth == null) {
            chain.doFilter(request, response);
            return;
        }

        String key = resolveKey(request, path);
        Bucket bucket = rateLimitBuckets.get(key, k -> Bucket.builder().addLimit(bandwidth).build());
        ConsumptionProbe probe = bucket.tryConsumeAndReturnRemaining(1);

        response.addHeader("X-Rate-Limit-Remaining", String.valueOf(probe.getRemainingTokens()));

        if (probe.isConsumed()) {
            chain.doFilter(request, response);
        } else {
            long retryAfterSeconds = TimeUnit.NANOSECONDS.toSeconds(probe.getNanosToWaitForRefill());
            response.setStatus(429);
            response.setContentType("application/json;charset=UTF-8");
            response.addHeader("Retry-After", String.valueOf(retryAfterSeconds));
            response.getWriter().write(
                    "{\"success\":false,\"message\":\"Quá nhiều yêu cầu. Vui lòng thử lại sau "
                    + retryAfterSeconds + " giây.\",\"retryAfter\":" + retryAfterSeconds + "}"
            );
        }
    }

    private Bandwidth resolveBandwidth(String path, String method) {
        if (path.equals("/oauth2/authorization/microsoft") || path.contains("/login/oauth2")) {
            return LOGIN_LIMIT;
        }
        if (path.contains("/users/search") || path.contains("/search")) {
            return SEARCH_LIMIT;
        }
        if ("POST".equalsIgnoreCase(method) && path.contains("/upload")) {
            return UPLOAD_LIMIT;
        }
        if (path.startsWith("/api/")) {
            return GENERAL_LIMIT;
        }
        return null; // static resources, actuator, etc. — no limit
    }

    private String resolveKey(HttpServletRequest request, String path) {
        return IpUtils.extractIp(request) + ":" + normalizePath(path);
    }

    private String normalizePath(String path) {
        return path.replaceAll("/[0-9a-fA-F-]{8,}", "/{id}");
    }
}
