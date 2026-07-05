package com.myiu.portal.repository;

import com.myiu.portal.entity.CourseSchedule;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface CourseScheduleRepository extends JpaRepository<CourseSchedule, UUID> {
    List<CourseSchedule> findByCourseIdIn(List<UUID> courseIds);
    List<CourseSchedule> findByCourseIdOrderByStartTimeAsc(UUID courseId);
}
