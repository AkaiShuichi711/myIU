package com.myiu.portal.repository;

import com.myiu.portal.entity.CoursePost;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface CoursePostRepository extends JpaRepository<CoursePost, UUID> {
    List<CoursePost> findByCourseIdAndIsPublishedTrueOrderByCreatedAtDesc(UUID courseId);
}
