package com.myiu.portal.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "post_media")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PostMedia {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_id", nullable = false)
    private Post post;

    @Column(name = "file_id")
    private UUID fileId;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String url;

    @Column(name = "media_type", length = 20)
    private String mediaType = "image";

    @Column(name = "sort_order")
    private short sortOrder;
}
