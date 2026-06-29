package com.myiu.portal.dto;

import lombok.Data;

@Data
public class UpdateUserRequest {
    private String name;
    private String username;
    private String bio;
    private String imageUrl;
    private Boolean isPrivate;
}
