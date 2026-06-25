package com.myiu.portal.repository;

import com.myiu.portal.entity.Course;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface CourseRepository extends JpaRepository<Course, UUID> {
    List<Course> findByIsActiveTrueOrderByCreatedAtDesc();
    List<Course> findByCreatorId(UUID creatorId);
}
