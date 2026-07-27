package com.myiu.portal.service;

import com.myiu.portal.dto.CommentDTO;
import com.myiu.portal.entity.*;
import com.myiu.portal.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@RequiredArgsConstructor
public class CommentService {

    private final CommentRepository commentRepository;
    private final PostRepository postRepository;
    private final UserRepository userRepository;

    @Transactional
    public CommentDTO add(UUID postId, UUID userId, String body, List<String> taggedUsers) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Post post = postRepository.getReferenceById(postId);
        Comment comment = Comment.builder()
                .post(post).user(user)
                .authorName(user.getName())
                .authorImage(user.getImageUrl())
                .body(body)
                .taggedUsers(taggedUsers != null ? taggedUsers : new ArrayList<>())
                .build();
        return toDTO(commentRepository.save(comment));
    }

    public List<CommentDTO> getByPost(UUID postId) {
        return commentRepository.findByPostIdOrderByCreatedAtAsc(postId)
                .stream().map(this::toDTO).toList();
    }

    @Transactional
    public void delete(UUID commentId, UUID userId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));
        if (!comment.getUser().getId().equals(userId))
            throw new RuntimeException("Unauthorized");
        commentRepository.delete(comment);
    }

    private CommentDTO toDTO(Comment c) {
        return CommentDTO.builder()
                .id(c.getId()).postId(c.getPost().getId())
                .userId(c.getUser().getId())
                .authorName(c.getAuthorName()).authorImage(c.getAuthorImage())
                .body(c.getBody()).taggedUsers(c.getTaggedUsers())
                .createdAt(c.getCreatedAt()).build();
    }
}
