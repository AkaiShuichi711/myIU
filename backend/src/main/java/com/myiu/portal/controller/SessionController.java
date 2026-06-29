package com.myiu.portal.controller;

import com.myiu.portal.dto.ApiResponse;
import com.myiu.portal.entity.LoginSession;
import com.myiu.portal.entity.User;
import com.myiu.portal.repository.UserRepository;
import com.myiu.portal.service.SessionService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/sessions")
@RequiredArgsConstructor
public class SessionController {

    private final SessionService sessionService;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<List<SessionDTO>>> getSessions(
            @AuthenticationPrincipal UserDetails userDetails,
            HttpServletRequest request) {

        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        String sessionIdStr = (String) request.getAttribute("sessionId");
        UUID currentSessionId = null;
        try {
            if (sessionIdStr != null) currentSessionId = UUID.fromString(sessionIdStr);
        } catch (IllegalArgumentException ignored) {}

        if (currentSessionId != null) {
            sessionService.updateLastActive(currentSessionId);
        }

        List<LoginSession> sessions = sessionService.getSessions(user.getId());
        final UUID finalCurrentId = currentSessionId;

        List<SessionDTO> dtos = sessions.stream()
                .map(s -> SessionDTO.from(s, finalCurrentId))
                .toList();

        return ResponseEntity.ok(ApiResponse.ok(dtos));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> revokeSession(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetails userDetails) {

        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        sessionService.revokeSession(id, user.getId());
        return ResponseEntity.ok(ApiResponse.ok("Session revoked", null));
    }

    @DeleteMapping("/others")
    public ResponseEntity<ApiResponse<Void>> revokeOtherSessions(
            @AuthenticationPrincipal UserDetails userDetails,
            HttpServletRequest request) {

        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        String sessionIdStr = (String) request.getAttribute("sessionId");
        if (sessionIdStr != null) {
            try {
                sessionService.revokeOtherSessions(UUID.fromString(sessionIdStr), user.getId());
            } catch (IllegalArgumentException ignored) {}
        }

        return ResponseEntity.ok(ApiResponse.ok("Other sessions revoked", null));
    }

    @PutMapping("/heartbeat")
    public ResponseEntity<ApiResponse<Void>> heartbeat(HttpServletRequest request) {
        String sessionIdStr = (String) request.getAttribute("sessionId");
        if (sessionIdStr != null) {
            try {
                sessionService.updateLastActive(UUID.fromString(sessionIdStr));
            } catch (IllegalArgumentException ignored) {}
        }
        return ResponseEntity.ok(ApiResponse.ok("OK", null));
    }

    public record SessionDTO(
            String id,
            String ipAddress,
            String country,
            String city,
            String countryCode,
            String browser,
            String browserVersion,
            String os,
            String deviceType,
            boolean current,
            String createdAt,
            String lastActive
    ) {
        public static SessionDTO from(LoginSession s, UUID currentSessionId) {
            return new SessionDTO(
                    s.getId().toString(),
                    s.getIpAddress(),
                    s.getCountry(),
                    s.getCity(),
                    s.getCountryCode(),
                    s.getBrowser(),
                    s.getBrowserVersion(),
                    s.getOs(),
                    s.getDeviceType(),
                    currentSessionId != null && s.getId().equals(currentSessionId),
                    s.getCreatedAt() != null ? s.getCreatedAt().toString() : null,
                    s.getLastActive() != null ? s.getLastActive().toString() : null
            );
        }
    }
}
