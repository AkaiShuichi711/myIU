package com.myiu.portal.controller;

import com.myiu.portal.dto.*;
import com.myiu.portal.repository.UserRepository;
import com.myiu.portal.service.CommentService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/comments")
@RequiredArgsConstructor
public class CommentController {

    private final CommentService commentService;
    private final UserRepository userRepository;

    private UUID currentUserId(UserDetails principal) {
        return userRepository.findByEmail(principal.getUsername()).orElseThrow().getId();
    }

    @PostMapping("/post/{postId}")
    public ResponseEntity<ApiResponse<CommentDTO>> add(
            @PathVariable UUID postId,
            @RequestBody CommentRequest req,
            @AuthenticationPrincipal UserDetails principal) {
        return ResponseEntity.ok(ApiResponse.ok(
                commentService.add(postId, currentUserId(principal), req.getBody(), req.getTaggedUsers())));
    }

    @GetMapping("/post/{postId}")
    public ResponseEntity<ApiResponse<List<CommentDTO>>> getByPost(@PathVariable UUID postId) {
        return ResponseEntity.ok(ApiResponse.ok(commentService.getByPost(postId)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetails principal) {
        commentService.delete(id, currentUserId(principal));
        return ResponseEntity.ok(ApiResponse.ok(null));
    }

    @Data
    public static class CommentRequest {
        private String body;
        private List<String> taggedUsers;
    }
}
