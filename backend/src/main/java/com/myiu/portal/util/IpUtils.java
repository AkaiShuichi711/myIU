package com.myiu.portal.util;

import jakarta.servlet.http.HttpServletRequest;

/**
 * Extracts the client IP for rate limiting (brute-force protection) and the
 * login-session audit trail — both security-sensitive.
 *
 * SECURITY: X-Forwarded-For / X-Real-IP are client-supplied headers. Trusting
 * them unconditionally lets any caller forge their IP with a single header
 * (e.g. sending a new X-Forwarded-For on every request bypasses the 5/min
 * login rate limit entirely, and forges the location shown in Settings ->
 * Sessions). We only honor them when the direct TCP peer (getRemoteAddr,
 * which the client cannot fake) is itself a private/loopback address — i.e.
 * the request actually came through our own reverse proxy on the same host
 * or internal network, not straight from the internet. Anyone who can reach
 * the app directly (bypassing that proxy) gets their real getRemoteAddr()
 * instead, regardless of what they put in the headers.
 */
public final class IpUtils {
    private IpUtils() {}

    public static String extractIp(HttpServletRequest request) {
        String peer = request.getRemoteAddr();
        if (!isTrustedProxy(peer)) {
            return peer;
        }
        String xff = request.getHeader("X-Forwarded-For");
        if (xff != null && !xff.isBlank()) return normalize(xff.split(",")[0].trim());
        String realIp = request.getHeader("X-Real-IP");
        if (realIp != null && !realIp.isBlank()) return normalize(realIp.trim());
        return normalize(peer);
    }

    /** Is the direct TCP peer our own reverse proxy (loopback / private network)? */
    private static boolean isTrustedProxy(String ip) {
        if (ip == null) return false;
        if (ip.equals("127.0.0.1") || ip.equals("0:0:0:0:0:0:0:1") || ip.equals("::1")) return true;
        if (ip.startsWith("10.") || ip.startsWith("192.168.")) return true;
        if (ip.startsWith("172.")) {
            String[] parts = ip.split("\\.");
            try {
                int second = Integer.parseInt(parts[1]);
                return second >= 16 && second <= 31;
            } catch (Exception ignored) { /* fall through */ }
        }
        return false;
    }

    /**
     * Cosmetic: Java's getRemoteAddr() returns the uncompressed IPv6 loopback
     * form "0:0:0:0:0:0:0:1" for local connections — technically correct but
     * unrecognizable. Show the equivalent, familiar IPv4 dotted form instead.
     */
    private static String normalize(String ip) {
        if ("0:0:0:0:0:0:0:1".equals(ip) || "::1".equals(ip)) return "127.0.0.1";
        return ip;
    }
}
