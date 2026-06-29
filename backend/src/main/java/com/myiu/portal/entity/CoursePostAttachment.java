package com.myiu.portal.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "course_post_attachments")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CoursePostAttachment {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_post_id", nullable = false)
    private CoursePost coursePost;

    @Column(name = "file_id")
    private UUID fileId;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String url;

    @Column(name = "file_name", length = 500)
    private String fileName;
}
