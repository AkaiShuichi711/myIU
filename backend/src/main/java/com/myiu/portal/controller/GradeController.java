package com.myiu.portal.controller;

import com.myiu.portal.dto.ApiResponse;
import com.myiu.portal.entity.CourseGrade;
import com.myiu.portal.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.*;

@RestController
@RequestMapping("/api/grades")
@RequiredArgsConstructor
public class GradeController {

    private final CourseGradeRepository gradeRepository;
    private final UserRepository userRepository;

    private UUID currentUserId(UserDetails principal) {
        return userRepository.findByEmail(principal.getUsername()).orElseThrow().getId();
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Object>> get(
            @RequestParam(required = false) UUID courseId,
            @RequestParam(required = false) UUID studentId) {
        if (courseId != null && studentId != null) {
            return ResponseEntity.ok(ApiResponse.ok(
                    gradeRepository.findByCourseIdAndStudentId(courseId, studentId).orElse(null)));
        }
        if (courseId != null) {
            return ResponseEntity.ok(ApiResponse.ok(gradeRepository.findByCourseId(courseId)));
        }
        if (studentId != null) {
            return ResponseEntity.ok(ApiResponse.ok(gradeRepository.findByStudentId(studentId)));
        }
        return ResponseEntity.ok(ApiResponse.ok(gradeRepository.findAll()));
    }

    @PostMapping
    @PreAuthorize("hasRole('lecturer')")
    public ResponseEntity<ApiResponse<CourseGrade>> upsert(
            @RequestBody GradeRequest req,
            @AuthenticationPrincipal UserDetails principal) {
        Optional<CourseGrade> existing = gradeRepository.findByCourseIdAndStudentId(req.getCourseId(), req.getStudentId());
        CourseGrade grade = existing.orElse(CourseGrade.builder()
                .courseId(req.getCourseId())
                .studentId(req.getStudentId())
                .studentName(req.getStudentName())
                .build());
        grade.setGradedBy(currentUserId(principal));
        if (req.getQuiz() != null) grade.setQuiz(BigDecimal.valueOf(req.getQuiz()));
        if (req.getExercise() != null) grade.setExercise(BigDecimal.valueOf(req.getExercise()));
        if (req.getLab() != null) grade.setLab(BigDecimal.valueOf(req.getLab()));
        if (req.getMidterm() != null) grade.setMidterm(BigDecimal.valueOf(req.getMidterm()));
        if (req.getProject() != null) grade.setProject(BigDecimal.valueOf(req.getProject()));
        if (req.getFinalScore() != null) grade.setFinalScore(BigDecimal.valueOf(req.getFinalScore()));
        return ResponseEntity.ok(ApiResponse.ok(gradeRepository.save(grade)));
    }

    @lombok.Data
    public static class GradeRequest {
        private UUID courseId;
        private UUID studentId;
        private String studentName;
        private Double quiz;
        private Double exercise;
        private Double lab;
        private Double midterm;
        private Double project;
        private Double finalScore;
    }
}
