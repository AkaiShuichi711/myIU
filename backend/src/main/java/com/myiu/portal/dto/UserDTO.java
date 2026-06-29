package com.myiu.portal.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.Set;
import java.util.UUID;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class UserDTO {
    private UUID id;
    private String name;
    private String username;
    private String email;
    private String imageUrl;
    private String bio;
    private String authProvider;
    @JsonProperty("isPrivate")
    private boolean isPrivate;
    private Set<String> roles;
    private Instant createdAt;
}
