package com.myiu.portal.controller;

import com.myiu.portal.dto.*;
import com.myiu.portal.repository.UserRepository;
import com.myiu.portal.service.TimetableService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequiredArgsConstructor
public class TimetableController {

    private final TimetableService timetableService;
    private final UserRepository userRepository;

    private UUID currentUserId(UserDetails principal) {
        return userRepository.findByEmail(principal.getUsername()).orElseThrow().getId();
    }

    @GetMapping("/api/timetable")
    public ResponseEntity<ApiResponse<List<TimetableEntryDTO>>> getMyTimetable(
            @AuthenticationPrincipal UserDetails principal) {
        UUID userId = currentUserId(principal);
        List<String> roles = principal.getAuthorities().stream()
                .map(a -> a.getAuthority()).collect(Collectors.toList());
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
            @RequestBody CourseScheduleRequest req) {
        return ResponseEntity.ok(ApiResponse.ok(timetableService.addSchedule(courseId, req)));
    }

    @DeleteMapping("/api/course-schedules/{scheduleId}")
    public ResponseEntity<ApiResponse<Void>> deleteSchedule(
            @PathVariable UUID scheduleId) {
        timetableService.deleteSchedule(scheduleId);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }
}
