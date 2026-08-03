package com.myiu.portal.repository;

import com.myiu.portal.entity.AssignmentSubmission;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface AssignmentSubmissionRepository extends JpaRepository<AssignmentSubmission, UUID> {
    List<AssignmentSubmission> findByCoursePostIdOrderBySubmittedAtAsc(UUID coursePostId);
    Optional<AssignmentSubmission> findByCoursePostIdAndStudentId(UUID coursePostId, UUID studentId);
    List<AssignmentSubmission> findByStudentIdOrderBySubmittedAtDesc(UUID studentId);
}