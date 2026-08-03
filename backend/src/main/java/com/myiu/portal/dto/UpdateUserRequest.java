package com.myiu.portal.dto;

import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateUserRequest {
    @Size(max = 255)
    private String name;
    @Size(max = 50)
    private String username;
    @Size(max = 500)
    private String bio;
    @Size(max = 1000)
    private String imageUrl;
    private Boolean isPrivate;
}
