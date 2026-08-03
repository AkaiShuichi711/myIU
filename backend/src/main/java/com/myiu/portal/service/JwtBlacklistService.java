package com.myiu.portal.service;

import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class JwtBlacklistService {

    private final ConcurrentHashMap<String, Instant> revokedTokens = new ConcurrentHashMap<>();

    public void revoke(String jti, Instant expiry) {
        revokedTokens.put(jti, expiry);
    }

    public boolean isRevoked(String jti) {
        Instant expiry = revokedTokens.get(jti);
        if (expiry == null) return false;
        if (Instant.now().isAfter(expiry)) {
            revokedTokens.remove(jti);
            return false;
        }
        return true;
    }
}
