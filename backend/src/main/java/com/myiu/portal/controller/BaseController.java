package com.myiu.portal.controller;

import com.myiu.portal.entity.User;
import com.myiu.portal.exception.NotFoundException;
import com.myiu.portal.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.UUID;

public abstract class BaseController {

    @Autowired
    protected UserRepository userRepository;

    protected UUID currentUserId(UserDetails principal) {
        return currentUser(principal).getId();
    }

    protected User currentUser(UserDetails principal) {
        return userRepository.findByEmail(principal.getUsername())
                .orElseThrow(() -> new NotFoundException("User not found"));
    }
}
