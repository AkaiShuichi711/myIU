package com.myiu.portal.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Data @NoArgsConstructor @AllArgsConstructor
public class CourseScheduleRequest {
    @NotBlank
    private String dayOfWeek;
    @NotBlank
    private String startTime;
    @NotBlank
    private String endTime;
    private String room;
}
