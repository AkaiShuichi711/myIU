package com.myiu.portal.service;

import com.myiu.portal.dto.*;
import com.myiu.portal.entity.User;
import com.myiu.portal.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public UserDTO getById(UUID id) {
        return toDTO(userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found")));
    }

    public UserDTO getByUsername(String username) {
        return toDTO(userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found")));
    }

    public UserDTO update(UUID id, UpdateUserRequest req) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (req.getName() != null) user.setName(req.getName());
        if (req.getUsername() != null) user.setUsername(req.getUsername());
        if (req.getBio() != null) user.setBio(req.getBio());
        if (req.getImageUrl() != null) user.setImageUrl(req.getImageUrl());
        if (req.getIsPrivate() != null) user.setPrivate(req.getIsPrivate());
        return toDTO(userRepository.save(user));
    }

    public List<UserDTO> search(String query) {
        return userRepository.searchByNameOrUsername(query)
                .stream().map(this::toDTO).toList();
    }

    public UserDTO toDTO(User user) {
        return UserDTO.builder()
                .id(user.getId())
                .name(user.getName())
                .username(user.getUsername())
                .email(user.getEmail())
                .imageUrl(user.getImageUrl())
                .bio(user.getBio())
                .authProvider(user.getAuthProvider())
                .isPrivate(user.isPrivate())
                .roles(user.getRoles())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
