package com.myiu.portal.service;

import com.myiu.portal.dto.NotificationDTO;
import com.myiu.portal.entity.*;
import com.myiu.portal.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public List<NotificationDTO> getForUser(UUID userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream().map(this::toDTO).toList();
    }

    public long getUnreadCount(UUID userId) {
        return notificationRepository.countByUserIdAndReadFalse(userId);
    }

    @Transactional
    public void markAllRead(UUID userId) {
        notificationRepository.markAllReadByUserId(userId);
    }

    @Transactional
    public void create(UUID userId, String type, UUID actorId, String actorName,
                       UUID postId, UUID commentId, String message, String linkTo) {
        User user = userRepository.getReferenceById(userId);
        Notification n = Notification.builder()
                .user(user).type(type).actorId(actorId).actorName(actorName)
                .postId(postId).commentId(commentId)
                .message(message).read(false).linkTo(linkTo)
                .build();
        notificationRepository.save(n);

        // Push real-time via WebSocket — principal name = email (JWT subject)
        try {
            messagingTemplate.convertAndSendToUser(
                user.getEmail(),
                "/queue/notifications",
                toDTO(n)
            );
        } catch (Exception ignored) {
            // WebSocket push is best-effort; notification is already persisted
        }
    }

    private NotificationDTO toDTO(Notification n) {
        return NotificationDTO.builder()
                .id(n.getId()).userId(n.getUser().getId())
                .type(n.getType()).actorId(n.getActorId()).actorName(n.getActorName())
                .postId(n.getPostId()).commentId(n.getCommentId())
                .message(n.getMessage()).read(n.isRead())
                .linkTo(n.getLinkTo()).createdAt(n.getCreatedAt()).build();
    }
}
