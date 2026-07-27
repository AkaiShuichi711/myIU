package com.myiu.portal.controller;

import com.myiu.portal.dto.ApiResponse;
import com.myiu.portal.entity.Block;
import com.myiu.portal.repository.BlockRepository;
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
public class BlockController extends BaseController {

    private final BlockRepository blockRepository;

    @PostMapping
    public ResponseEntity<ApiResponse<Block>> block(
            @RequestBody BlockRequest req,
            @AuthenticationPrincipal UserDetails principal) {
        UUID blockerId = currentUserId(principal);
        return blockRepository.findByBlockerIdAndBlockedId(blockerId, req.getBlockedId())
                .map(existing -> ResponseEntity.ok(ApiResponse.ok(existing)))
                .orElseGet(() -> {
                    Block block = Block.builder()
                            .blockerId(blockerId)
                            .blockedId(req.getBlockedId())
                            .blockedName(req.getBlockedName())
                            .build();
                    return ResponseEntity.ok(ApiResponse.ok(blockRepository.save(block)));
                });
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
