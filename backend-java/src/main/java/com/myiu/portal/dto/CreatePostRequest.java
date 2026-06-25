package com.myiu.portal.dto;

import lombok.Data;

import java.util.List;

@Data
public class CreatePostRequest {
    private String caption;
    private String location;
    private List<String> tags;
    private List<String> imageUrls;
}
