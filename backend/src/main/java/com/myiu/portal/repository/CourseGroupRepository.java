package com.myiu.portal.repository;

import com.myiu.portal.entity.CourseGroup;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface CourseGroupRepository extends JpaRepository<CourseGroup, UUID> {
    List<CourseGroup> findByCourseId(UUID courseId);
    List<CourseGroup> findByLecturerId(UUID lecturerId);
}
