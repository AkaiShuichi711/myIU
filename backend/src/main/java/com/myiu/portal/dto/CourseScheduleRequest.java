package com.myiu.portal.dto;

import lombok.*;

@Data @NoArgsConstructor @AllArgsConstructor
public class CourseScheduleRequest {
    private String dayOfWeek;
    private String startTime;
    private String endTime;
    private String room;
}
