package com.myiu.portal.repository;

import com.myiu.portal.entity.Block;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface BlockRepository extends JpaRepository<Block, UUID> {
    Optional<Block> findByBlockerIdAndBlockedId(UUID blockerId, UUID blockedId);
    List<Block> findByBlockerId(UUID blockerId);
    boolean existsByBlockerIdAndBlockedId(UUID blockerId, UUID blockedId);
}
