package com.myiu.portal.controller;

import com.myiu.portal.dto.*;
import com.myiu.portal.repository.UserRepository;
import com.myiu.portal.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;
    private final UserRepository userRepository;

    private UUID currentUserId(UserDetails principal) {
        return userRepository.findByEmail(principal.getUsername()).orElseThrow().getId();
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<NotificationDTO>>> get(
            @AuthenticationPrincipal UserDetails principal) {
        return ResponseEntity.ok(ApiResponse.ok(notificationService.getForUser(currentUserId(principal))));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<ApiResponse<Long>> unreadCount(
            @AuthenticationPrincipal UserDetails principal) {
        return ResponseEntity.ok(ApiResponse.ok(notificationService.getUnreadCount(currentUserId(principal))));
    }

    @PostMapping("/mark-all-read")
    public ResponseEntity<ApiResponse<Void>> markAllRead(
            @AuthenticationPrincipal UserDetails principal) {
        notificationService.markAllRead(currentUserId(principal));
        return ResponseEntity.ok(ApiResponse.ok(null));
    }

    /** DEV ONLY — tạo notification test cho chính mình */
    @PostMapping("/test")
    public ResponseEntity<ApiResponse<Void>> createTest(
            @AuthenticationPrincipal UserDetails principal,
            @RequestParam(defaultValue = "system") String type,
            @RequestParam(defaultValue = "Test notification") String message,
            @RequestParam(defaultValue = "/home") String linkTo) {
        notificationService.create(currentUserId(principal), type, null, null, null, null, message, linkTo);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }
}
