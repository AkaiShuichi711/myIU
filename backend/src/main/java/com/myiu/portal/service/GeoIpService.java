package com.myiu.portal.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.myiu.portal.repository.LoginSessionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
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
     * Province/district/ward from GPS coordinates — best-effort only.
     * Any field can be null if OpenStreetMap has no data at that level for
     * the given point (ward-level tagging in particular is patchy outside
     * major city centers). This is fundamentally more precise than IP
     * lookup (which cannot go below city level at all), but not guaranteed
     * complete everywhere.
     */
    public record AddressDetail(String province, String district, String ward) {
        static AddressDetail empty() { return new AddressDetail(null, null, null); }
    }

    /**
     * Async GeoIP enrichment — called after session is saved.
     * Runs on geoIpExecutor thread pool; does NOT block login.
     *
     * @Transactional is required here, not optional: @Modifying repository
     * queries (updateGeoLocation below) only work inside a transaction that
     * the CALLING code supplies — Spring Data does not wrap custom @Query
     * methods in their own transaction the way it does save()/findById().
     * @Async runs on a different thread with no transaction of its own, so
     * without this the update throws TransactionRequiredException every
     * time (silently swallowed by the catch below at DEBUG level) — which
     * is exactly why every session was stuck on "Resolving" forever.
     */
    @Async("geoIpExecutor")
    @Transactional
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

    /**
     * Reverse-geocodes browser GPS coordinates into a Vietnamese administrative
     * address (tỉnh/thành phố → quận/huyện → phường/xã) via OpenStreetMap's
     * free Nominatim API. Only reachable when the user granted the browser's
     * location permission — see SessionService.updatePreciseLocation().
     *
     * Nominatim's usage policy (nominatim.org/release-docs/latest/api/Usage-policy/)
     * requires a real identifying User-Agent and caps free use at ~1 req/sec;
     * both are fine here since this fires at most once per login, not per request.
     *
     * Parsing strategy — verified against real coordinates (IU campus, D1,
     * Bình Thạnh) before shipping: Nominatim's structured `address` object
     * has NO dedicated "province" field for Vietnam (the top-level tỉnh/
     * thành phố, e.g. "Thành phố Hồ Chí Minh", never appears as its own key —
     * only inside `display_name` as free text). But `display_name` is
     * consistently ordered most-specific → most-general, and after
     * stripping the trailing country + postcode, the last three segments
     * are reliably [phường/xã, quận/huyện hoặc thành phố thuộc tỉnh, tỉnh/
     * thành phố] in that order across every real address tested. That
     * positional read is what we use, rather than guessing which of
     * Nominatim's loosely-defined OSM tag names (suburb/city/county/etc.,
     * which shift meaning by region) maps to which Vietnamese admin tier.
     *
     * Still best-effort: sparser rural OSM data can have fewer segments
     * than expected, in which case the higher tiers (district/province)
     * degrade to null rather than guessing wrong. Ward is cross-checked
     * against address.suburb/quarter when available, since that field
     * matched the positional read in every real test.
     */
    public AddressDetail reverseGeocode(double lat, double lng) {
        try {
            // Locale.US pinned deliberately: String.format("%f", ...) is locale-sensitive
            // and would emit "10,77" instead of "10.77" under a comma-decimal locale
            // (e.g. a server running with LANG=vi_VN or de_DE), silently corrupting the
            // query string. Never happened on this dev machine (JVM default is en_US)
            // but would break reverse geocoding outright wherever it isn't.
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(String.format(java.util.Locale.US,
                            "https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=%f&lon=%f&addressdetails=1&accept-language=vi&zoom=18",
                            lat, lng)))
                    .header("User-Agent", "myIU-Portal/1.0 (student university portal; contact: admin@iu.edu.vn)")
                    .timeout(Duration.ofSeconds(5))
                    .GET()
                    .build();
            HttpResponse<String> response = HTTP_CLIENT.send(request, HttpResponse.BodyHandlers.ofString());
            JsonNode root = MAPPER.readTree(response.body());
            JsonNode address = root.path("address");
            String displayName = root.path("display_name").asText("");
            if (displayName.isBlank()) return AddressDetail.empty();

            List<String> segments = new ArrayList<>(Arrays.asList(displayName.split(",\\s*")));
            if (!segments.isEmpty() && segments.get(segments.size() - 1).matches("(?i)vi[eệ]t ?nam")) {
                segments.remove(segments.size() - 1);
            }
            if (!segments.isEmpty() && segments.get(segments.size() - 1).matches("\\d+")) {
                segments.remove(segments.size() - 1);
            }

            String province = at(segments, segments.size() - 1);
            String district = at(segments, segments.size() - 2);
            String ward = firstNonBlank(address, "suburb", "quarter", "neighbourhood", "village", "hamlet");
            if (ward == null) ward = at(segments, segments.size() - 3);

            // Not every address actually has 3 real tiers — some wards sit
            // directly under the province post-restructuring, with no
            // separate "thành phố thuộc tỉnh" in between. When that happens,
            // the positional read for district lands on the same segment as
            // ward (confirmed with a real duplicate: "Phường Bình Thạnh,
            // Phường Bình Thạnh, Thành phố Hồ Chí Minh"). Drop it rather than
            // show the same value twice.
            if (district != null && district.equalsIgnoreCase(ward)) district = null;
            // Same guard, other direction — a 2-segment display_name (ward absent,
            // just [district-ish, province]) can leave district == province instead.
            if (district != null && district.equalsIgnoreCase(province)) district = null;

            return new AddressDetail(province, district, ward);
        } catch (Exception e) {
            log.debug("Reverse geocoding failed for ({}, {}): {}", lat, lng, e.getMessage());
            return AddressDetail.empty();
        }
    }

    private String at(List<String> list, int index) {
        return index >= 0 && index < list.size() ? list.get(index) : null;
    }

    private String firstNonBlank(JsonNode address, String... keys) {
        for (String key : keys) {
            String value = address.path(key).asText("");
            if (!value.isBlank()) return value;
        }
        return null;
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
