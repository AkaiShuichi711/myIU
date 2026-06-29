package com.myiu.portal.controller;

import com.myiu.portal.dto.*;
import com.myiu.portal.repository.UserRepository;
import com.myiu.portal.service.CourseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/courses")
@RequiredArgsConstructor
public class CourseController {

    private final CourseService courseService;
    private final UserRepository userRepository;

    private UUID currentUserId(UserDetails principal) {
        return userRepository.findByEmail(principal.getUsername()).orElseThrow().getId();
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<CourseDTO>>> getAll() {
        return ResponseEntity.ok(ApiResponse.ok(courseService.getAll()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CourseDTO>> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(courseService.getById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<CourseDTO>> create(
            @RequestBody CourseDTO req,
            @AuthenticationPrincipal UserDetails principal) {
        return ResponseEntity.ok(ApiResponse.ok(courseService.create(currentUserId(principal), req)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<CourseDTO>> update(
            @PathVariable UUID id,
            @RequestBody CourseDTO req) {
        return ResponseEntity.ok(ApiResponse.ok(courseService.update(id, req)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable UUID id) {
        courseService.delete(id);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }
}
