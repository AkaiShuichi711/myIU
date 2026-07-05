package com.myiu.portal.dto;

import lombok.*;

import java.util.UUID;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class TimetableEntryDTO {
    private UUID scheduleId;
    private UUID courseId;
    private String courseName;
    private String courseCode;
    private String coverColor;
    private String semester;
    private String dayOfWeek;
    private String startTime;
    private String endTime;
    private String room;
}
