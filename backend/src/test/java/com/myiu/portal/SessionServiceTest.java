package com.myiu.portal;

import com.myiu.portal.entity.LoginSession;
import com.myiu.portal.entity.User;
import com.myiu.portal.repository.LoginSessionRepository;
import com.myiu.portal.service.GeoIpService;
import com.myiu.portal.service.SessionService;
import com.myiu.portal.util.UserAgentParser;
import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Unit tests for SessionService.
 * Uses Mockito to isolate from DB and GeoIP — fast, no infrastructure needed.
 */
@ExtendWith(MockitoExtension.class)
class SessionServiceTest {

    @Mock LoginSessionRepository sessionRepo;
    @Mock GeoIpService geoIpService;
    @Mock HttpServletRequest request;

    @InjectMocks SessionService sessionService;

    @Test
    void createSession_saves_immediately_without_waiting_for_geoip() {
        // Arrange
        User user = new User();
        user.setId(UUID.randomUUID());

        // Peer is a public IP (untrusted) — IpUtils.extractIp() returns it
        // directly without ever consulting X-Forwarded-For/X-Real-IP, so
        // those headers are deliberately left unstubbed here.
        when(request.getRemoteAddr()).thenReturn("1.2.3.4");
        when(request.getHeader("User-Agent")).thenReturn(
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0"
        );

        LoginSession saved = LoginSession.builder()
                .id(UUID.randomUUID())
                .userId(user.getId())
                .build();
        when(sessionRepo.save(any())).thenReturn(saved);

        // Act
        LoginSession result = sessionService.createSession(user, request);

        // Assert
        assertThat(result).isNotNull();
        verify(sessionRepo, times(1)).save(any());

        // GeoIP must be async — called once (fire-and-forget), but doesn't block
        verify(geoIpService, times(1)).lookupAndEnrich(eq("1.2.3.4"), eq(saved.getId()));
    }

    @Test
    void createSession_uses_x_forwarded_for_header_only_from_trusted_proxy() {
        User user = new User();
        user.setId(UUID.randomUUID());

        // X-Forwarded-For is only honored when the direct TCP peer is itself
        // our own trusted reverse proxy (loopback/private) — otherwise a
        // client could forge any IP with a single header (see IpUtils).
        when(request.getRemoteAddr()).thenReturn("127.0.0.1");
        when(request.getHeader("X-Forwarded-For")).thenReturn("203.0.113.5, 10.0.0.1");
        when(request.getHeader("User-Agent")).thenReturn("TestAgent/1.0");
        when(sessionRepo.save(any())).thenReturn(LoginSession.builder().id(UUID.randomUUID()).build());

        sessionService.createSession(user, request);

        // First IP from X-Forwarded-For chain is the real client IP
        verify(geoIpService).lookupAndEnrich(eq("203.0.113.5"), any());
    }

    @Test
    void createSession_ignores_x_forwarded_for_from_untrusted_peer() {
        User user = new User();
        user.setId(UUID.randomUUID());

        // Peer is a public IP reaching the app directly (not through our
        // reverse proxy) — the forged header must be ignored, and the real
        // peer address used instead. This is the regression test for the
        // IP-spoofing fix in IpUtils.extractIp(). lenient(): the header is
        // deliberately expected to go UNUSED — that's the behavior under test.
        when(request.getRemoteAddr()).thenReturn("8.8.8.8");
        lenient().when(request.getHeader("X-Forwarded-For")).thenReturn("203.0.113.5");
        when(request.getHeader("User-Agent")).thenReturn("TestAgent/1.0");
        when(sessionRepo.save(any())).thenReturn(LoginSession.builder().id(UUID.randomUUID()).build());

        sessionService.createSession(user, request);

        verify(geoIpService).lookupAndEnrich(eq("8.8.8.8"), any());
        verify(geoIpService, never()).lookupAndEnrich(eq("203.0.113.5"), any());
    }

    @Test
    void revokeSession_only_revokes_if_owned_by_user() {
        UUID sessionId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        UUID otherUserId = UUID.randomUUID();

        LoginSession session = LoginSession.builder()
                .id(sessionId)
                .userId(otherUserId)   // owned by different user
                .revoked(false)
                .build();

        when(sessionRepo.findById(sessionId)).thenReturn(java.util.Optional.of(session));

        sessionService.revokeSession(sessionId, userId);

        // Must NOT save (ownership check failed)
        verify(sessionRepo, never()).save(any());
        assertThat(session.isRevoked()).isFalse();
    }
}
