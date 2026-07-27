package com.myiu.portal.service;

import com.myiu.portal.dto.*;
import com.myiu.portal.entity.*;
import com.myiu.portal.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@RequiredArgsConstructor
public class PostService {

    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final SaveRepository saveRepository;

    @Transactional
    public PostDTO create(UUID creatorId, CreatePostRequest req) {
        User creator = userRepository.findById(creatorId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Post post = Post.builder()
                .creator(creator)
                .caption(req.getCaption())
                .location(req.getLocation())
                .tags(req.getTags() != null ? req.getTags() : new ArrayList<>())
                .build();
        if (req.getImageUrls() != null) {
            short order = 0;
            for (String url : req.getImageUrls()) {
                PostMedia media = PostMedia.builder()
                        .post(post)
                        .url(url)
                        .mediaType("image")
                        .sortOrder(order++)
                        .build();
                post.getMedia().add(media);
            }
        }
        return toDTO(postRepository.save(post));
    }

    public Page<PostDTO> getAll(int page, int size) {
        return postRepository.findAllByOrderByCreatedAtDesc(PageRequest.of(page, size))
                .map(this::toDTO);
    }

    public Page<PostDTO> getByUser(UUID userId, int page, int size) {
        return postRepository.findByCreatorIdOrderByCreatedAtDesc(userId, PageRequest.of(page, size))
                .map(this::toDTO);
    }

    public PostDTO getById(UUID id) {
        return toDTO(postRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Post not found")));
    }

    @Transactional
    public PostDTO update(UUID postId, UUID userId, CreatePostRequest req) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));
        if (!post.getCreator().getId().equals(userId))
            throw new RuntimeException("Unauthorized");
        if (req.getCaption() != null) post.setCaption(req.getCaption());
        if (req.getLocation() != null) post.setLocation(req.getLocation());
        if (req.getTags() != null) post.setTags(req.getTags());
        if (req.getImageUrls() != null) {
            post.getMedia().clear();
            short order = 0;
            for (String url : req.getImageUrls()) {
                PostMedia media = PostMedia.builder()
                        .post(post).url(url).mediaType("image").sortOrder(order++).build();
                post.getMedia().add(media);
            }
        }
        return toDTO(postRepository.save(post));
    }

    @Transactional
    public void delete(UUID postId, UUID userId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));
        if (!post.getCreator().getId().equals(userId))
            throw new RuntimeException("Unauthorized");
        postRepository.delete(post);
    }

    @Transactional
    public PostDTO toggleLike(UUID postId, UUID userId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));
        if (post.getLikes().contains(userId)) {
            post.getLikes().remove(userId);
        } else {
            post.getLikes().add(userId);
        }
        return toDTO(postRepository.save(post));
    }

    @Transactional
    public void savePost(UUID postId, UUID userId) {
        if (saveRepository.findByUserIdAndPostId(userId, postId).isEmpty()) {
            User user = userRepository.getReferenceById(userId);
            Post post = postRepository.getReferenceById(postId);
            saveRepository.save(Save.builder().user(user).post(post).build());
        }
    }

    @Transactional
    public void unsavePost(UUID postId, UUID userId) {
        saveRepository.deleteByUserIdAndPostId(userId, postId);
    }

    public List<PostDTO> getSavedPosts(UUID userId) {
        return saveRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(s -> toDTO(s.getPost()))
                .toList();
    }

    public PostDTO toDTO(Post post) {
        User creator = post.getCreator();
        return PostDTO.builder()
                .id(post.getId())
                .creatorId(creator.getId())
                .creatorName(creator.getName())
                .creatorUsername(creator.getUsername())
                .creatorImageUrl(creator.getImageUrl())
                .caption(post.getCaption())
                .location(post.getLocation())
                .tags(post.getTags())
                .likes(post.getLikes())
                .media(post.getMedia().stream().map(m -> PostDTO.MediaDTO.builder()
                        .id(m.getId()).url(m.getUrl())
                        .mediaType(m.getMediaType()).sortOrder(m.getSortOrder())
                        .build()).toList())
                .createdAt(post.getCreatedAt())
                .updatedAt(post.getUpdatedAt())
                .build();
    }
}
