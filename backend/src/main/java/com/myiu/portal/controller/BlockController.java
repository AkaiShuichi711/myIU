package com.myiu.portal.controller;

import com.myiu.portal.dto.ApiResponse;
import com.myiu.portal.entity.Block;
import com.myiu.portal.repository.*;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/blocks")
@RequiredArgsConstructor
public class BlockController {

    private final BlockRepository blockRepository;
    private final UserRepository userRepository;

    private UUID currentUserId(UserDetails principal) {
        return userRepository.findByEmail(principal.getUsername()).orElseThrow().getId();
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Block>> block(
            @RequestBody BlockRequest req,
            @AuthenticationPrincipal UserDetails principal) {
        UUID blockerId = currentUserId(principal);
        if (blockRepository.existsByBlockerIdAndBlockedId(blockerId, req.getBlockedId())) {
            return ResponseEntity.ok(ApiResponse.ok(
                    blockRepository.findByBlockerIdAndBlockedId(blockerId, req.getBlockedId()).orElseThrow()));
        }
        Block block = Block.builder()
                .blockerId(blockerId)
                .blockedId(req.getBlockedId())
                .blockedName(req.getBlockedName())
                .build();
        return ResponseEntity.ok(ApiResponse.ok(blockRepository.save(block)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> unblock(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetails principal) {
        blockRepository.deleteById(id);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Block>>> getBlocked(
            @AuthenticationPrincipal UserDetails principal) {
        return ResponseEntity.ok(ApiResponse.ok(
                blockRepository.findByBlockerId(currentUserId(principal))));
    }

    @Data
    public static class BlockRequest {
        private UUID blockedId;
        private String blockedName;
    }
}
