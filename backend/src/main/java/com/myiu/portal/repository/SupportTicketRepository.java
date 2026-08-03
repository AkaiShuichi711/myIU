package com.myiu.portal.repository;

import com.myiu.portal.entity.SupportTicket;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface SupportTicketRepository extends JpaRepository<SupportTicket, UUID> {
    List<SupportTicket> findBySubmitterIdOrderByCreatedAtDesc(UUID submitterId);
    List<SupportTicket> findAllByOrderByCreatedAtDesc();
    List<SupportTicket> findByStatusOrderByCreatedAtDesc(String status);
}
