package com.myiu.portal.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class CourseDTO {
    private UUID id;
    private String name;
    private String code;
    private String semester;
    private String description;
    private String coverColor;
    private boolean isActive;
    private UUID creatorId;
    private String creatorName;
    private Instant createdAt;
}
