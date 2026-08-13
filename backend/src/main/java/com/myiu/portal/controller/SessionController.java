package com.myiu.portal.controller;

import com.myiu.portal.dto.ApiResponse;
import com.myiu.portal.entity.LoginSession;
import com.myiu.portal.entity.User;
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
public class SessionController extends BaseController {

    private final SessionService sessionService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<SessionDTO>>> getSessions(
            @AuthenticationPrincipal UserDetails userDetails,
            HttpServletRequest request) {

        User user = currentUser(userDetails);

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

        User user = currentUser(userDetails);

        sessionService.revokeSession(id, user.getId());
        return ResponseEntity.ok(ApiResponse.ok("Session revoked", null));
    }

    @DeleteMapping("/others")
    public ResponseEntity<ApiResponse<Void>> revokeOtherSessions(
            @AuthenticationPrincipal UserDetails userDetails,
            HttpServletRequest request) {

        User user = currentUser(userDetails);

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

    /**
     * Called once, right after login, if the browser's geolocation
     * permission prompt was granted — see useReportGeoLocation on the
     * frontend. Silently no-ops if denied/unavailable (IP-based
     * country/city from login already covers that case). Scoped to the
     * caller's own current session — see SessionService.updatePreciseLocation.
     */
    @PutMapping("/current/location")
    public ResponseEntity<ApiResponse<Void>> reportLocation(
            @AuthenticationPrincipal UserDetails userDetails,
            HttpServletRequest request,
            @RequestBody LocationRequest body) {

        User user = currentUser(userDetails);
        String sessionIdStr = (String) request.getAttribute("sessionId");
        if (sessionIdStr != null) {
            try {
                sessionService.updatePreciseLocation(
                        UUID.fromString(sessionIdStr), user.getId(), body.latitude(), body.longitude());
            } catch (IllegalArgumentException ignored) {}
        }
        return ResponseEntity.ok(ApiResponse.ok("OK", null));
    }

    public record LocationRequest(double latitude, double longitude) {}

    public record SessionDTO(
            String id,
            String ipAddress,
            String country,
            String city,
            String countryCode,
            String province,
            String district,
            String ward,
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
                    s.getProvince(),
                    s.getDistrict(),
                    s.getWard(),
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
