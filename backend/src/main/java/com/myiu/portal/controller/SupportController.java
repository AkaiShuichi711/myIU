package com.myiu.portal.controller;

import com.myiu.portal.dto.ApiResponse;
import com.myiu.portal.entity.SupportTicket;
import com.myiu.portal.entity.User;
import com.myiu.portal.repository.SupportTicketRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/support")
@RequiredArgsConstructor
public class SupportController extends BaseController {

    private final SupportTicketRepository ticketRepository;


    @PostMapping
    public ResponseEntity<ApiResponse<SupportTicket>> create(
            @Valid @RequestBody CreateTicketRequest req,
            @AuthenticationPrincipal UserDetails principal) {
        User user = currentUser(principal);
        SupportTicket ticket = SupportTicket.builder()
                .submitterId(user.getId())
                .submitterName(user.getName())
                .submitterEmail(user.getEmail())
                .service(req.getService())
                .need(req.getNeed())
                .description(req.getDescription())
                .attachmentUrl(req.getAttachmentUrl())
                .build();
        return ResponseEntity.ok(ApiResponse.ok(ticketRepository.save(ticket)));
    }

    @GetMapping("/mine")
    public ResponseEntity<ApiResponse<List<SupportTicket>>> mine(
            @AuthenticationPrincipal UserDetails principal) {
        User user = currentUser(principal);
        return ResponseEntity.ok(ApiResponse.ok(
                ticketRepository.findBySubmitterIdOrderByCreatedAtDesc(user.getId())));
    }

    @Data
    public static class CreateTicketRequest {
        @NotBlank
        private String service;
        @NotBlank
        private String need;
        @NotBlank
        private String description;
        private String attachmentUrl;
    }
}
