package com.myiu.portal.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "form_submissions")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class FormSubmission {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "submitter_id", nullable = false)
    private UUID submitterId;

    @Column(name = "submitter_name")
    private String submitterName;

    @Column(name = "submitter_email")
    private String submitterEmail;

    @Column(name = "form_template_id")
    private UUID formTemplateId;

    @Column(name = "form_title", length = 500)
    private String formTitle;

    @Column(name = "uploaded_file_id")
    private UUID uploadedFileId;

    @Column(name = "uploaded_file_url", columnDefinition = "TEXT")
    private String uploadedFileUrl;

    @Column(name = "approver_email")
    private String approverEmail;

    @Column(name = "approver_name")
    private String approverName;

    @Column(length = 20)
    private String status = "pending";

    @Column(name = "rejection_reason", columnDefinition = "TEXT")
    private String rejectionReason;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private Instant updatedAt;
}
