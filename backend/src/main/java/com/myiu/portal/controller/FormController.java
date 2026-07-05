package com.myiu.portal.controller;

import com.myiu.portal.dto.ApiResponse;
import com.myiu.portal.entity.*;
import com.myiu.portal.repository.*;
import com.myiu.portal.service.EmailService;
import com.myiu.portal.service.StorageService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;

@RestController
@RequestMapping("/api/forms")
@RequiredArgsConstructor
public class FormController {

    private final FormTemplateRepository formTemplateRepository;
    private final FormSubmissionRepository formSubmissionRepository;
    private final UserRepository userRepository;
    private final StorageService storageService;
    private final EmailService emailService;

    private UUID currentUserId(UserDetails principal) {
        return userRepository.findByEmail(principal.getUsername()).orElseThrow().getId();
    }

    // ── Templates ──────────────────────────────────────────────────────────────

    @GetMapping("/templates")
    public ResponseEntity<ApiResponse<List<FormTemplate>>> getTemplates() {
        return ResponseEntity.ok(ApiResponse.ok(
                formTemplateRepository.findByIsActiveTrueOrderBySortOrderAsc()));
    }

    @PostMapping("/templates")
    public ResponseEntity<ApiResponse<FormTemplate>> createTemplate(
            @RequestBody FormTemplate req,
            @AuthenticationPrincipal UserDetails principal) {
        req.setCreatedBy(currentUserId(principal));
        return ResponseEntity.ok(ApiResponse.ok(formTemplateRepository.save(req)));
    }

    @PutMapping("/templates/{id}")
    public ResponseEntity<ApiResponse<FormTemplate>> updateTemplate(
            @PathVariable UUID id,
            @RequestBody FormTemplate req) {
        FormTemplate existing = formTemplateRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Template not found"));
        if (req.getTitle() != null) existing.setTitle(req.getTitle());
        if (req.getDescription() != null) existing.setDescription(req.getDescription());
        if (req.getCategory() != null) existing.setCategory(req.getCategory());
        if (req.getFileUrl() != null) existing.setFileUrl(req.getFileUrl());
        if (req.getFileName() != null) existing.setFileName(req.getFileName());
        existing.setActive(req.isActive());
        return ResponseEntity.ok(ApiResponse.ok(formTemplateRepository.save(existing)));
    }

    @DeleteMapping("/templates/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteTemplate(@PathVariable UUID id) {
        formTemplateRepository.deleteById(id);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }

    @PostMapping("/templates/{id}/upload")
    public ResponseEntity<ApiResponse<String>> uploadTemplateFile(
            @PathVariable UUID id,
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal UserDetails principal) throws Exception {
        StoredFile stored = storageService.store(file, currentUserId(principal));
        String url = storageService.getUrl(stored.getId());
        FormTemplate t = formTemplateRepository.findById(id).orElseThrow();
        t.setFileId(stored.getId());
        t.setFileUrl(url);
        t.setFileName(file.getOriginalFilename());
        formTemplateRepository.save(t);
        return ResponseEntity.ok(ApiResponse.ok(url));
    }

    // ── Submissions ────────────────────────────────────────────────────────────

    @PostMapping("/submissions")
    public ResponseEntity<ApiResponse<FormSubmission>> createSubmission(
            @RequestBody FormSubmission req,
            @AuthenticationPrincipal UserDetails principal) {
        req.setSubmitterId(currentUserId(principal));
        req.setStatus("pending");
        return ResponseEntity.ok(ApiResponse.ok(formSubmissionRepository.save(req)));
    }

    @GetMapping("/submissions/mine")
    public ResponseEntity<ApiResponse<List<FormSubmission>>> mySubmissions(
            @AuthenticationPrincipal UserDetails principal) {
        return ResponseEntity.ok(ApiResponse.ok(
                formSubmissionRepository.findBySubmitterIdOrderByCreatedAtDesc(currentUserId(principal))));
    }

    @GetMapping("/submissions/approver")
    public ResponseEntity<ApiResponse<List<FormSubmission>>> approverSubmissions(
            @RequestParam String email) {
        return ResponseEntity.ok(ApiResponse.ok(
                formSubmissionRepository.findByApproverEmailOrderByCreatedAtDesc(email)));
    }

    @GetMapping("/submissions/{id}")
    public ResponseEntity<ApiResponse<FormSubmission>> getSubmission(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(formSubmissionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Submission not found"))));
    }

    @PutMapping("/submissions/{id}")
    public ResponseEntity<ApiResponse<FormSubmission>> updateSubmission(
            @PathVariable UUID id,
            @RequestBody StatusRequest req) {
        FormSubmission s = formSubmissionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Submission not found"));
        s.setStatus(req.getStatus());
        if (req.getRejectionReason() != null) s.setRejectionReason(req.getRejectionReason());
        FormSubmission saved = formSubmissionRepository.save(s);

        String email = saved.getSubmitterEmail();
        String name  = saved.getSubmitterName() != null ? saved.getSubmitterName() : "Sinh viên";
        String title = saved.getFormTitle() != null ? saved.getFormTitle() : "Đơn của bạn";
        String sid   = saved.getId().toString();
        if ("approved".equalsIgnoreCase(saved.getStatus()) && email != null) {
            emailService.sendFormApproved(email, name, title, sid);
        } else if ("rejected".equalsIgnoreCase(saved.getStatus()) && email != null) {
            emailService.sendFormRejected(email, name, title, saved.getRejectionReason(), sid);
        }

        return ResponseEntity.ok(ApiResponse.ok(saved));
    }

    @PostMapping("/submissions/{id}/upload")
    public ResponseEntity<ApiResponse<String>> uploadSubmissionFile(
            @PathVariable UUID id,
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal UserDetails principal) throws Exception {
        StoredFile stored = storageService.store(file, currentUserId(principal));
        String url = storageService.getUrl(stored.getId());
        FormSubmission s = formSubmissionRepository.findById(id).orElseThrow();
        s.setUploadedFileId(stored.getId());
        s.setUploadedFileUrl(url);
        formSubmissionRepository.save(s);
        return ResponseEntity.ok(ApiResponse.ok(url));
    }

    @Data
    public static class StatusRequest {
        private String status;
        private String rejectionReason;
    }
}
