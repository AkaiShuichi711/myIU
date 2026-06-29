package com.myiu.portal.repository;

import com.myiu.portal.entity.Save;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SaveRepository extends JpaRepository<Save, UUID> {
    List<Save> findByUserIdOrderByCreatedAtDesc(UUID userId);
    Optional<Save> findByUserIdAndPostId(UUID userId, UUID postId);
    void deleteByUserIdAndPostId(UUID userId, UUID postId);
}
