package com.myiu.portal.controller;

import com.myiu.portal.dto.*;
import com.myiu.portal.service.TimetableService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequiredArgsConstructor
public class TimetableController extends BaseController {

    private final TimetableService timetableService;

    @GetMapping("/api/timetable")
    public ResponseEntity<ApiResponse<List<TimetableEntryDTO>>> getMyTimetable(
            @AuthenticationPrincipal UserDetails principal) {
        UUID userId = currentUserId(principal);
        List<String> roles = principal.getAuthorities().stream()
                .map(a -> a.getAuthority()).toList();
        return ResponseEntity.ok(ApiResponse.ok(timetableService.getForUser(userId, roles)));
    }

    @GetMapping("/api/courses/{courseId}/schedules")
    public ResponseEntity<ApiResponse<List<TimetableEntryDTO>>> getCourseSchedules(
            @PathVariable UUID courseId) {
        return ResponseEntity.ok(ApiResponse.ok(timetableService.getForCourse(courseId)));
    }

    @PostMapping("/api/courses/{courseId}/schedules")
    public ResponseEntity<ApiResponse<TimetableEntryDTO>> addSchedule(
            @PathVariable UUID courseId,
            @Valid @RequestBody CourseScheduleRequest req) {
        return ResponseEntity.ok(ApiResponse.ok(timetableService.addSchedule(courseId, req)));
    }

    @DeleteMapping("/api/course-schedules/{scheduleId}")
    public ResponseEntity<ApiResponse<Void>> deleteSchedule(
            @PathVariable UUID scheduleId) {
        timetableService.deleteSchedule(scheduleId);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }
}
