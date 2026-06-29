package com.myiu.portal.repository;

import com.myiu.portal.entity.LoginSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public interface LoginSessionRepository extends JpaRepository<LoginSession, UUID> {

    List<LoginSession> findByUserIdAndRevokedFalseOrderByLastActiveDesc(UUID userId);

    @Modifying
    @Query("UPDATE LoginSession s SET s.revoked = true WHERE s.userId = :userId AND s.id != :currentId")
    void revokeAllExcept(@Param("userId") UUID userId, @Param("currentId") UUID currentId);

    boolean existsByIdAndRevokedFalse(UUID id);

    @Modifying
    @Query("UPDATE LoginSession s SET s.lastActive = :now WHERE s.id = :id AND s.revoked = false")
    void updateLastActive(@Param("id") UUID id, @Param("now") Instant now);

    @Modifying
    @Query("UPDATE LoginSession s SET s.country = :country, s.city = :city, s.countryCode = :code WHERE s.id = :id")
    void updateGeoLocation(@Param("id") UUID id,
                           @Param("country") String country,
                           @Param("city") String city,
                           @Param("code") String countryCode);
}
