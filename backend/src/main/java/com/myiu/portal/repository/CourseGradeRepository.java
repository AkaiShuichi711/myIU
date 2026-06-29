package com.myiu.portal.repository;

import com.myiu.portal.entity.CourseGrade;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CourseGradeRepository extends JpaRepository<CourseGrade, UUID> {
    List<CourseGrade> findByCourseId(UUID courseId);
    Optional<CourseGrade> findByCourseIdAndStudentId(UUID courseId, UUID studentId);
    List<CourseGrade> findByStudentId(UUID studentId);
}
