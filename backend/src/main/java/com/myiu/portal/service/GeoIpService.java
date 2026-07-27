package com.myiu.portal.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.myiu.portal.repository.LoginSessionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.UUID;

/**
 * Resolves geographic location from an IP address via ip-api.com.
 *
 * Strategy: fire-and-forget async enrichment.
 * Login flow creates the session immediately with no geo data.
 * This service then runs lookupAndEnrich() on a dedicated thread pool (geoIpExecutor)
 * so the 3s external HTTP call never touches the request thread.
 *
 * Same pattern used by Segment, Mixpanel for async event enrichment pipelines.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class GeoIpService {

    private final LoginSessionRepository sessionRepo;

    private static final HttpClient HTTP_CLIENT = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(3))
            .build();

    private static final ObjectMapper MAPPER = new ObjectMapper();

    public record GeoLocation(String country, String city, String countryCode) {
        public static GeoLocation unknown() { return new GeoLocation("Unknown", "Unknown", ""); }
        public static GeoLocation local()   { return new GeoLocation("Local Network", "Local", ""); }
    }

    /**
     * Async GeoIP enrichment — called after session is saved.
     * Runs on geoIpExecutor thread pool; does NOT block login.
     */
    @Async("geoIpExecutor")
    public void lookupAndEnrich(String ip, UUID sessionId) {
        GeoLocation geo = lookup(ip);
        try {
            sessionRepo.updateGeoLocation(sessionId, geo.country(), geo.city(), geo.countryCode());
        } catch (Exception e) {
            log.debug("GeoIP enrichment skipped for session {}: {}", sessionId, e.getMessage());
        }
    }

    /** Synchronous lookup — use only when caller can tolerate up to 3s wait. */
    public GeoLocation lookup(String ip) {
        if (ip == null || ip.isBlank() || isPrivate(ip)) {
            return GeoLocation.local();
        }
        try {
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("http://ip-api.com/json/" + ip + "?fields=status,country,countryCode,city"))
                    .timeout(Duration.ofSeconds(3))
                    .GET()
                    .build();
            HttpResponse<String> response = HTTP_CLIENT.send(request, HttpResponse.BodyHandlers.ofString());
            JsonNode node = MAPPER.readTree(response.body());
            if ("success".equals(node.path("status").asText())) {
                return new GeoLocation(
                        node.path("country").asText("Unknown"),
                        node.path("city").asText("Unknown"),
                        node.path("countryCode").asText("")
                );
            }
        } catch (Exception e) {
            log.debug("GeoIP lookup failed for {}: {}", ip, e.getMessage());
        }
        return GeoLocation.unknown();
    }

    private boolean isPrivate(String ip) {
        if (ip.startsWith("127.") || ip.startsWith("10.") || ip.startsWith("192.168.")
                || ip.equals("0:0:0:0:0:0:0:1") || ip.equals("::1") || ip.equals("0.0.0.0")) {
            return true;
        }
        if (ip.startsWith("172.")) {
            String[] parts = ip.split("\\.");
            try {
                int second = Integer.parseInt(parts[1]);
                return second >= 16 && second <= 31;
            } catch (Exception ignored) {}
        }
        return false;
    }
}
