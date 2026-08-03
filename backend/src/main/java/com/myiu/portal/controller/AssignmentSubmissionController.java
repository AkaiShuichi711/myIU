package com.myiu.portal.controller;

import com.myiu.portal.dto.ApiResponse;
import com.myiu.portal.entity.AssignmentSubmission;
import com.myiu.portal.entity.CoursePost;
import com.myiu.portal.entity.User;
import com.myiu.portal.exception.NotFoundException;
import com.myiu.portal.repository.AssignmentSubmissionRepository;
import com.myiu.portal.repository.CoursePostRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/submissions")
@RequiredArgsConstructor
public class AssignmentSubmissionController extends BaseController {

    private final AssignmentSubmissionRepository submissionRepo;
    private final CoursePostRepository coursePostRepo;

    /** Student: submit or resubmit an assignment */
    @PostMapping
    public ResponseEntity<ApiResponse<AssignmentSubmission>> submit(
            @Valid @RequestBody SubmitRequest req,
            @AuthenticationPrincipal UserDetails principal) {
        User user = currentUser(principal);
        CoursePost post = coursePostRepo.findById(req.getCoursePostId())
                .orElseThrow(() -> new NotFoundException("Assignment not found"));

        boolean late = post.getDueDate() != null && Instant.now().isAfter(post.getDueDate());

        AssignmentSubmission sub = submissionRepo
                .findByCoursePostIdAndStudentId(req.getCoursePostId(), user.getId())
                .orElseGet(AssignmentSubmission::new);

        sub.setCoursePostId(req.getCoursePostId());
        sub.setStudentId(user.getId());
        sub.setStudentName(user.getName());
        sub.setFileUrl(req.getFileUrl());
        sub.setFileId(req.getFileId());
        sub.setFileName(req.getFileName());
        sub.setTextContent(req.getTextContent());
        if (sub.getStatus() != AssignmentSubmission.Status.GRADED) {
            sub.setStatus(late ? AssignmentSubmission.Status.LATE : AssignmentSubmission.Status.SUBMITTED);
        }

        return ResponseEntity.ok(ApiResponse.ok(submissionRepo.save(sub)));
    }

    /** Lecturer: list all submissions for an assignment */
    @GetMapping
    @PreAuthorize("hasRole('lecturer')")
    public ResponseEntity<ApiResponse<List<AssignmentSubmission>>> listByPost(
            @RequestParam UUID coursePostId) {
        return ResponseEntity.ok(ApiResponse.ok(
                submissionRepo.findByCoursePostIdOrderBySubmittedAtAsc(coursePostId)));
    }

    /** Student: view own submission */
    @GetMapping("/mine")
    public ResponseEntity<ApiResponse<AssignmentSubmission>> mine(
            @RequestParam UUID coursePostId,
            @AuthenticationPrincipal UserDetails principal) {
        User user = currentUser(principal);
        return ResponseEntity.ok(ApiResponse.ok(
                submissionRepo.findByCoursePostIdAndStudentId(coursePostId, user.getId()).orElse(null)));
    }

    /** Lecturer: grade a submission */
    @PutMapping("/{id}/grade")
    @PreAuthorize("hasRole('lecturer')")
    public ResponseEntity<ApiResponse<AssignmentSubmission>> grade(
            @PathVariable UUID id,
            @Valid @RequestBody GradeRequest req) {
        AssignmentSubmission sub = submissionRepo.findById(id)
                .orElseThrow(() -> new NotFoundException("Submission not found"));
        if (req.getScore() != null) sub.setScore(BigDecimal.valueOf(req.getScore()));
        if (req.getFeedback() != null) sub.setFeedback(req.getFeedback());
        sub.setStatus(AssignmentSubmission.Status.GRADED);
        return ResponseEntity.ok(ApiResponse.ok(submissionRepo.save(sub)));
    }

    @Data static class SubmitRequest {
        @NotNull
        private UUID coursePostId;
        private String fileUrl;
        private String fileId;
        private String fileName;
        private String textContent;
    }

    @Data static class GradeRequest {
        @DecimalMin("0.0") @DecimalMax("100.0")
        private Double score;
        private String feedback;
    }
}