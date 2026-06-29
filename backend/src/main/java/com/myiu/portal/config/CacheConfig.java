package com.myiu.portal.config;

import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.concurrent.TimeUnit;

@Configuration
@EnableCaching
public class CacheConfig {

    /**
     * Stores rate-limit Bucket per (IP + endpoint) key.
     * Max 100k entries covers ~100k unique IPs concurrently.
     * TTL 1h: bucket resets naturally after 1 hour of inactivity.
     *
     * Caffeine uses W-TinyLFU eviction — better cache hit ratio than plain LRU
     * for access patterns where "hot" entries are frequently reused.
     * Google's Guava cache and Caffeine are the industry standard for this use case.
     */
    @Bean
    public Cache<String, io.github.bucket4j.Bucket> rateLimitBuckets() {
        return Caffeine.newBuilder()
                .maximumSize(100_000)
                .expireAfterAccess(1, TimeUnit.HOURS)
                .build();
    }
}
