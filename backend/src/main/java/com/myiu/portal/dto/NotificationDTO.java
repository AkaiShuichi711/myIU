package com.myiu.portal.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class NotificationDTO {
    private UUID id;
    private UUID userId;
    private String type;
    private UUID actorId;
    private String actorName;
    private UUID postId;
    private UUID commentId;
    private String message;
    private boolean read;
    private String linkTo;
    private Instant createdAt;
}
