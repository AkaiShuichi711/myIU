package com.myiu.portal.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "login_sessions")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class LoginSession {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "ip_address", length = 45)
    private String ipAddress;

    @Column(length = 100)
    private String country;

    @Column(length = 100)
    private String city;

    @Column(name = "country_code", length = 10)
    private String countryCode;

    @Column(length = 100)
    private String browser;

    @Column(name = "browser_version", length = 50)
    private String browserVersion;

    @Column(length = 100)
    private String os;

    @Column(name = "device_type", length = 20)
    @Builder.Default
    private String deviceType = "desktop";

    @Column(name = "raw_user_agent", columnDefinition = "TEXT")
    private String rawUserAgent;

    @Column(name = "is_revoked", nullable = false)
    @Builder.Default
    private boolean revoked = false;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @Column(name = "last_active")
    private Instant lastActive;
}
