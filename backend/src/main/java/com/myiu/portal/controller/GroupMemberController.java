package com.myiu.portal.controller;

import com.myiu.portal.dto.ApiResponse;
import com.myiu.portal.entity.*;
import com.myiu.portal.repository.*;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/group-members")
@RequiredArgsConstructor
public class GroupMemberController {

    private final GroupMemberRepository groupMemberRepository;
    private final CourseGroupRepository courseGroupRepository;
    private final CourseRepository courseRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<List<GroupMember>>> get(
            @RequestParam(required = false) UUID groupId,
            @RequestParam(required = false) UUID courseId,
            @RequestParam(required = false) UUID studentId) {
        List<GroupMember> result;
        if (groupId != null && studentId != null) {
            result = groupMemberRepository.findByGroupId(groupId).stream()
                    .filter(m -> m.getStudentId().equals(studentId)).toList();
        } else if (groupId != null) {
            result = groupMemberRepository.findByGroupId(groupId);
        } else if (courseId != null && studentId != null) {
            result = groupMemberRepository.findByStudentId(studentId).stream()
                    .filter(m -> m.getCourseId().equals(courseId)).toList();
        } else if (studentId != null) {
            result = groupMemberRepository.findByStudentId(studentId);
        } else {
            result = groupMemberRepository.findAll();
        }
        return ResponseEntity.ok(ApiResponse.ok(result));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<GroupMember>> add(@Valid @RequestBody MemberRequest req) {
        CourseGroup group = courseGroupRepository.getReferenceById(req.getGroupId());
        GroupMember member = GroupMember.builder()
                .group(group)
                .courseId(req.getCourseId())
                .studentId(req.getStudentId())
                .studentName(req.getStudentName())
                .build();
        return ResponseEntity.ok(ApiResponse.ok(groupMemberRepository.save(member)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> remove(@PathVariable UUID id) {
        groupMemberRepository.deleteById(id);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }

    @GetMapping("/student/{studentId}/courses")
    public ResponseEntity<ApiResponse<List<Course>>> getStudentCourses(@PathVariable UUID studentId) {
        List<UUID> courseIds = groupMemberRepository.findByStudentId(studentId).stream()
                .map(GroupMember::getCourseId).distinct().toList();
        return ResponseEntity.ok(ApiResponse.ok(courseRepository.findAllById(courseIds)));
    }

    @Data
    public static class MemberRequest {
        @NotNull
        private UUID groupId;
        @NotNull
        private UUID courseId;
        @NotNull
        private UUID studentId;
        private String studentName;
    }
}
