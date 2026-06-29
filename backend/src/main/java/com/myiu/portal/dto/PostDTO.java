package com.myiu.portal.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class PostDTO {
    private UUID id;
    private UUID creatorId;
    private String creatorName;
    private String creatorUsername;
    private String creatorImageUrl;
    private String caption;
    private String location;
    private List<String> tags;
    private Set<UUID> likes;
    private List<MediaDTO> media;
    private Instant createdAt;
    private Instant updatedAt;

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class MediaDTO {
        private UUID id;
        private String url;
        private String mediaType;
        private short sortOrder;
    }
}
