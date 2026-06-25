package com.myiu.portal.controller;

import com.myiu.portal.dto.ApiResponse;
import com.myiu.portal.entity.*;
import com.myiu.portal.repository.*;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.*;

@RestController
@RequestMapping("/api/course-posts")
@RequiredArgsConstructor
public class CoursePostController {

    private final CoursePostRepository coursePostRepository;
    private final CourseRepository courseRepository;
    private final CourseGroupRepository courseGroupRepository;
    private final UserRepository userRepository;

    private UUID currentUserId(UserDetails principal) {
        return userRepository.findByEmail(principal.getUsername()).orElseThrow().getId();
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<CoursePost>>> get(
            @RequestParam(required = false) UUID courseId) {
        List<CoursePost> result = courseId != null
                ? coursePostRepository.findByCourseIdAndIsPublishedTrueOrderByCreatedAtDesc(courseId)
                : coursePostRepository.findAll();
        return ResponseEntity.ok(ApiResponse.ok(result));
    }

    @PostMapping
    @PreAuthorize("hasRole('lecturer')")
    public ResponseEntity<ApiResponse<CoursePost>> create(
            @RequestBody CoursePostRequest req,
            @AuthenticationPrincipal UserDetails principal) {
        UUID userId = currentUserId(principal);
        var user = userRepository.findById(userId).orElseThrow();
        Course course = courseRepository.getReferenceById(req.getCourseId());
        CoursePost.CoursePostBuilder builder = CoursePost.builder()
                .course(course)
                .authorId(userId)
                .authorName(user.getName())
                .title(req.getTitle())
                .body(req.getBody())
                .type(req.getType() != null ? req.getType() : "announcement")
                .isPublished(true);
        if (req.getGroupId() != null) {
            builder.group(courseGroupRepository.getReferenceById(req.getGroupId()));
        }
        if (req.getDueDate() != null) {
            builder.dueDate(Instant.parse(req.getDueDate()));
        }
        CoursePost post = coursePostRepository.save(builder.build());
        return ResponseEntity.ok(ApiResponse.ok(post));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('lecturer')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable UUID id) {
        coursePostRepository.deleteById(id);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }

    @Data
    public static class CoursePostRequest {
        private UUID courseId;
        private UUID groupId;
        private String title;
        private String body;
        private String type;
        private String dueDate;
        private List<String> attachmentUrls;
        private List<String> attachmentNames;
    }
}
