package com.myiu.portal.repository;

import com.myiu.portal.entity.FormSubmission;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface FormSubmissionRepository extends JpaRepository<FormSubmission, UUID> {
    List<FormSubmission> findBySubmitterIdOrderByCreatedAtDesc(UUID submitterId);
    List<FormSubmission> findByStatusOrderByCreatedAtDesc(String status);
    List<FormSubmission> findByApproverEmailOrderByCreatedAtDesc(String approverEmail);
}
