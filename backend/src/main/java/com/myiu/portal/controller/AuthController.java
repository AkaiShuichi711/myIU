package com.myiu.portal.controller;

import com.myiu.portal.dto.*;
import com.myiu.portal.repository.UserRepository;
import com.myiu.portal.security.JwtService;
import com.myiu.portal.service.JwtBlacklistService;
import com.myiu.portal.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;
    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final JwtBlacklistService blacklistService;

    /**
     * Regular users authenticate via Microsoft 365 OAuth2 only.
     * Email/password login is disabled for students and lecturers.
     * Admin login uses a separate endpoint: POST /api/admin/auth/login
     */
    @PostMapping("/login")
    public ResponseEntity<?> login() {
        return ResponseEntity.status(405)
                .body(Map.of("error", "Password login is disabled. Please use Microsoft 365 to sign in."));
    }

    @PostMapping("/register")
    public ResponseEntity<?> register() {
        return ResponseEntity.status(405)
                .body(Map.of("error", "Self-registration is disabled. Contact your administrator."));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserDTO>> me(@AuthenticationPrincipal UserDetails principal) {
        return userRepository.findByEmail(principal.getUsername())
                .map(u -> ResponseEntity.ok(ApiResponse.ok(userService.toDTO(u))))
                .orElse(ResponseEntity.status(401).body(ApiResponse.error("Not authenticated")));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(
            @RequestHeader("Authorization") String authHeader) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String jwt = authHeader.substring(7);
            try {
                String jti = jwtService.extractJti(jwt);
                if (jti != null) {
                    blacklistService.revoke(jti, jwtService.extractExpiry(jwt));
                }
            } catch (Exception ignored) {}
        }
        return ResponseEntity.ok(ApiResponse.ok(null));
    }
}
