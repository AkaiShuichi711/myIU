package com.myiu.portal.service;

import com.myiu.portal.entity.LoginSession;
import com.myiu.portal.entity.User;
import com.myiu.portal.repository.LoginSessionRepository;
import com.myiu.portal.util.IpUtils;
import com.myiu.portal.util.UserAgentParser;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class SessionService {

    private final LoginSessionRepository sessionRepo;
    private final GeoIpService geoIpService;

    /**
     * Creates a login session and returns immediately — no GeoIP wait.
     *
     * GeoIP enrichment runs async on a dedicated thread pool (geoIpExecutor).
     * Login latency drops from ~3s (GeoIP timeout worst case) to <10ms.
     *
     * Pattern: write-then-enrich, used by Stripe for async fraud checks.
     *
     * NOT @Transactional on purpose: sessionRepo.save() below is already
     * transactional on its own (Spring Data wraps every repository call).
     * If this method itself were @Transactional, the INSERT wouldn't commit
     * until the method returns — but geoIpService.lookupAndEnrich() below
     * kicks off its UPDATE on a separate thread/connection immediately, so
     * it would race the still-open transaction, find no matching row under
     * READ COMMITTED, and silently update zero rows. That's exactly what
     * was happening: every session stayed on "Resolving" forever with no
     * error anywhere. Keeping save() as its own short transaction ensures
     * the INSERT is durably committed before the async enrichment fires.
     */
    public LoginSession createSession(User user, HttpServletRequest request) {
        String ip = IpUtils.extractIp(request);
        String ua = request.getHeader("User-Agent");

        LoginSession session = LoginSession.builder()
                .userId(user.getId())
                .ipAddress(ip)
                .country("Resolving")       // filled in async within seconds
                .city("Resolving")
                .countryCode("")
                .browser(UserAgentParser.parseBrowser(ua))
                .browserVersion(UserAgentParser.parseBrowserVersion(ua))
                .os(UserAgentParser.parseOs(ua))
                .deviceType(UserAgentParser.parseDeviceType(ua))
                .rawUserAgent(ua)
                .revoked(false)
                .lastActive(Instant.now())
                .build();

        LoginSession saved = sessionRepo.save(session);

        // Async GeoIP enrichment — does not block login
        geoIpService.lookupAndEnrich(ip, saved.getId());

        return saved;
    }

    public List<LoginSession> getSessions(UUID userId) {
        return sessionRepo.findByUserIdAndRevokedFalseOrderByLastActiveDesc(userId);
    }

    @Transactional
    public void revokeSession(UUID sessionId, UUID userId) {
        sessionRepo.findById(sessionId).ifPresent(s -> {
            if (s.getUserId().equals(userId)) {
                s.setRevoked(true);
                sessionRepo.save(s);
            }
        });
    }

    @Transactional
    public void revokeOtherSessions(UUID currentSessionId, UUID userId) {
        sessionRepo.revokeAllExcept(userId, currentSessionId);
    }

    @Transactional
    public void updateLastActive(UUID sessionId) {
        if (sessionId != null) {
            sessionRepo.updateLastActive(sessionId, Instant.now());
        }
    }

    /**
     * Called when the frontend gets browser GPS coordinates for the current
     * session (only happens if the user grants the location permission
     * prompt — see useReportGeoLocation on the frontend). Reverse-geocodes
     * on the geoIpExecutor pool (external HTTP call, same as IP lookup)
     * so this never blocks the request. Scoped to (sessionId, userId) —
     * a user can only ever update their own session's location.
     */
    @Async("geoIpExecutor")
    @Transactional
    public void updatePreciseLocation(UUID sessionId, UUID userId, double lat, double lng) {
        GeoIpService.AddressDetail addr = geoIpService.reverseGeocode(lat, lng);
        int updated = sessionRepo.updatePreciseLocation(
                sessionId, userId, lat, lng, addr.province(), addr.district(), addr.ward());
        if (updated == 0) {
            log.debug("updatePreciseLocation: no session {} owned by user {}", sessionId, userId);
        }
    }

}
