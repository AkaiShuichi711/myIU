package com.myiu.portal.repository;

import com.myiu.portal.entity.FormTemplate;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface FormTemplateRepository extends JpaRepository<FormTemplate, UUID> {
    List<FormTemplate> findByIsActiveTrueOrderBySortOrderAsc();
    List<FormTemplate> findByCategoryAndIsActiveTrue(String category);
}
