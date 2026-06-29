package com.myiu.portal.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "support_tickets")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class SupportTicket {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "submitter_id", nullable = false)
    private UUID submitterId;

    @Column(name = "submitter_name", length = 255)
    private String submitterName;

    @Column(name = "submitter_email", length = 255)
    private String submitterEmail;

    @Column(nullable = false, length = 100)
    private String service;

    @Column(nullable = false, length = 100)
    private String need;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(name = "attachment_url", columnDefinition = "TEXT")
    private String attachmentUrl;

    @Column(nullable = false, length = 20)
    @Builder.Default
    private String status = "open";

    @Column(columnDefinition = "TEXT")
    private String response;

    @Column(name = "resolved_by", length = 255)
    private String resolvedBy;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private Instant updatedAt;
}
