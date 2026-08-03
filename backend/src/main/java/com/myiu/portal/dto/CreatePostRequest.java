package com.myiu.portal.dto;

import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.List;

@Data
public class CreatePostRequest {
    @Size(max = 2000)
    private String caption;
    @Size(max = 255)
    private String location;
    @Size(max = 50)
    private List<String> tags;
    private List<String> imageUrls;
}
