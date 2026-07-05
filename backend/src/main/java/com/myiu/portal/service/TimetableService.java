package com.myiu.portal.service;

import com.myiu.portal.dto.*;
import com.myiu.portal.entity.*;
import com.myiu.portal.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TimetableService {

    private static final DateTimeFormatter TIME_FMT = DateTimeFormatter.ofPattern("HH:mm");

    private final CourseScheduleRepository scheduleRepository;
    private final CourseRepository courseRepository;
    private final GroupMemberRepository groupMemberRepository;

    public List<TimetableEntryDTO> getForUser(UUID userId, Collection<String> roles) {
        boolean isLecturerOrAdmin = roles.stream()
                .anyMatch(r -> r.equals("ROLE_LECTURER") || r.equals("ROLE_ADMIN"));

        List<UUID> courseIds;
        if (isLecturerOrAdmin) {
            courseIds = courseRepository.findByCreatorId(userId)
                    .stream().map(Course::getId).collect(Collectors.toList());
        } else {
            courseIds = groupMemberRepository.findByStudentId(userId)
                    .stream().map(GroupMember::getCourseId).distinct().collect(Collectors.toList());
        }

        if (courseIds.isEmpty()) return List.of();

        return scheduleRepository.findByCourseIdIn(courseIds)
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    public List<TimetableEntryDTO> getForCourse(UUID courseId) {
        return scheduleRepository.findByCourseIdOrderByStartTimeAsc(courseId)
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Transactional
    public TimetableEntryDTO addSchedule(UUID courseId, CourseScheduleRequest req) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));
        CourseSchedule schedule = CourseSchedule.builder()
                .course(course)
                .dayOfWeek(req.getDayOfWeek().toUpperCase())
                .startTime(LocalTime.parse(req.getStartTime(), TIME_FMT))
                .endTime(LocalTime.parse(req.getEndTime(), TIME_FMT))
                .room(req.getRoom())
                .build();
        return toDTO(scheduleRepository.save(schedule));
    }

    @Transactional
    public void deleteSchedule(UUID scheduleId) {
        scheduleRepository.deleteById(scheduleId);
    }

    private TimetableEntryDTO toDTO(CourseSchedule s) {
        return TimetableEntryDTO.builder()
                .scheduleId(s.getId())
                .courseId(s.getCourse().getId())
                .courseName(s.getCourse().getName())
                .courseCode(s.getCourse().getCode())
                .coverColor(s.getCourse().getCoverColor())
                .semester(s.getCourse().getSemester())
                .dayOfWeek(s.getDayOfWeek())
                .startTime(s.getStartTime().format(TIME_FMT))
                .endTime(s.getEndTime().format(TIME_FMT))
                .room(s.getRoom())
                .build();
    }
}
