package com.myiu.portal.controller;

import com.myiu.portal.dto.*;
import com.myiu.portal.service.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;

@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
public class PostController extends BaseController {

    private final PostService postService;
    private final StorageService storageService;


    @PostMapping
    public ResponseEntity<ApiResponse<PostDTO>> create(
            @Valid @RequestBody CreatePostRequest req,
            @AuthenticationPrincipal UserDetails principal) {
        return ResponseEntity.ok(ApiResponse.ok(postService.create(currentUserId(principal), req)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<PostDTO>>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(ApiResponse.ok(postService.getAll(page, size)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PostDTO>> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(postService.getById(id)));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<Page<PostDTO>>> getByUser(
            @PathVariable UUID userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(ApiResponse.ok(postService.getByUser(userId, page, size)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<PostDTO>> update(
            @PathVariable UUID id,
            @Valid @RequestBody CreatePostRequest req,
            @AuthenticationPrincipal UserDetails principal) {
        return ResponseEntity.ok(ApiResponse.ok(postService.update(id, currentUserId(principal), req)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetails principal) {
        postService.delete(id, currentUserId(principal));
        return ResponseEntity.ok(ApiResponse.ok(null));
    }

    @PostMapping("/{id}/like")
    public ResponseEntity<ApiResponse<PostDTO>> like(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetails principal) {
        return ResponseEntity.ok(ApiResponse.ok(postService.toggleLike(id, currentUserId(principal))));
    }

    @PostMapping("/{id}/save")
    public ResponseEntity<ApiResponse<Void>> save(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetails principal) {
        postService.savePost(id, currentUserId(principal));
        return ResponseEntity.ok(ApiResponse.ok(null));
    }

    @DeleteMapping("/{id}/save")
    public ResponseEntity<ApiResponse<Void>> unsave(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetails principal) {
        postService.unsavePost(id, currentUserId(principal));
        return ResponseEntity.ok(ApiResponse.ok(null));
    }

    @GetMapping("/saved")
    public ResponseEntity<ApiResponse<List<PostDTO>>> getSaved(
            @AuthenticationPrincipal UserDetails principal) {
        return ResponseEntity.ok(ApiResponse.ok(postService.getSavedPosts(currentUserId(principal))));
    }

    @PostMapping("/upload-image")
    public ResponseEntity<ApiResponse<String>> uploadImage(
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal UserDetails principal) throws Exception {
        var stored = storageService.store(file, currentUserId(principal));
        return ResponseEntity.ok(ApiResponse.ok(storageService.getUrl(stored.getId())));
    }
}
