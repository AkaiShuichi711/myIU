package com.myiu.portal.controller;

import com.myiu.portal.dto.*;
import com.myiu.portal.service.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController extends BaseController {

    private final UserService userService;
    private final StorageService storageService;

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<UserDTO>> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(userService.getById(id)));
    }

    @GetMapping("/by-username/{username}")
    public ResponseEntity<ApiResponse<UserDTO>> getByUsername(@PathVariable String username) {
        return ResponseEntity.ok(ApiResponse.ok(userService.getByUsername(username)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<UserDTO>> update(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateUserRequest req,
            @AuthenticationPrincipal UserDetails principal) {
        if (!id.equals(currentUserId(principal))) {
            return ResponseEntity.status(403).body(ApiResponse.error("Forbidden"));
        }
        return ResponseEntity.ok(ApiResponse.ok(userService.update(id, req)));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<UserDTO>>> search(
            @RequestParam String q,
            @RequestParam(required = false) String role) {
        List<UserDTO> result = (role != null && !role.isBlank())
                ? userService.searchByRole(q, role.toLowerCase())
                : userService.search(q);
        return ResponseEntity.ok(ApiResponse.ok(result));
    }

    @PostMapping("/{id}/avatar")
    public ResponseEntity<ApiResponse<String>> uploadAvatar(
            @PathVariable UUID id,
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal UserDetails principal) throws Exception {
        if (!id.equals(currentUserId(principal))) {
            return ResponseEntity.status(403).body(ApiResponse.error("Forbidden"));
        }
        var stored = storageService.store(file, id);
        String url = storageService.getUrl(stored.getId());
        UpdateUserRequest req = new UpdateUserRequest();
        req.setImageUrl(url);
        userService.update(id, req);
        return ResponseEntity.ok(ApiResponse.ok(url));
    }
}
