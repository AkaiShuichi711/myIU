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

import java.util.*;

@RestController
@RequestMapping("/api/course-groups")
@RequiredArgsConstructor
public class CourseGroupController {

    private final CourseGroupRepository courseGroupRepository;
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;

    private UUID currentUserId(UserDetails principal) {
        return userRepository.findByEmail(principal.getUsername()).orElseThrow().getId();
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<CourseGroup>>> get(
            @RequestParam(required = false) UUID courseId,
            @RequestParam(required = false) UUID lecturerId) {
        List<CourseGroup> result;
        if (courseId != null && lecturerId != null) {
            result = courseGroupRepository.findByCourseId(courseId).stream()
                    .filter(g -> g.getLecturerId().equals(lecturerId))
                    .toList();
        } else if (courseId != null) {
            result = courseGroupRepository.findByCourseId(courseId);
        } else if (lecturerId != null) {
            result = courseGroupRepository.findByLecturerId(lecturerId);
        } else {
            result = courseGroupRepository.findAll();
        }
        return ResponseEntity.ok(ApiResponse.ok(result));
    }

    @PostMapping
    @PreAuthorize("hasRole('lecturer')")
    public ResponseEntity<ApiResponse<CourseGroup>> create(@RequestBody GroupRequest req) {
        Course course = courseRepository.getReferenceById(req.getCourseId());
        CourseGroup group = CourseGroup.builder()
                .course(course)
                .lecturerId(req.getLecturerId())
                .lecturerName(req.getLecturerName())
                .name(req.getName())
                .description(req.getDescription())
                .build();
        return ResponseEntity.ok(ApiResponse.ok(courseGroupRepository.save(group)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('lecturer')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable UUID id) {
        courseGroupRepository.deleteById(id);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }

    @GetMapping("/lecturer/{lecturerId}/courses")
    public ResponseEntity<ApiResponse<List<UUID>>> getLecturerCourses(@PathVariable UUID lecturerId) {
        List<UUID> courseIds = courseGroupRepository.findByLecturerId(lecturerId).stream()
                .map(g -> g.getCourse().getId()).distinct().toList();
        return ResponseEntity.ok(ApiResponse.ok(courseIds));
    }

    @Data
    public static class GroupRequest {
        private UUID courseId;
        private UUID lecturerId;
        private String lecturerName;
        private String name;
        private String description;
    }
}
