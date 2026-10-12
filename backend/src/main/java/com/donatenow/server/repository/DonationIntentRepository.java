package com.donatenow.server.repository;

import com.donatenow.server.model.DonationIntent;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

public interface DonationIntentRepository extends JpaRepository<DonationIntent, String> {

    @Transactional
    @Modifying
    @Query(value = """
            INSERT INTO "DonationIntent" (id, "nonprofitSlug", "amountCents", frequency, "createdAt")
            VALUES (:id, :nonprofitSlug, :amountCents, CAST(:frequency AS "DonationFrequency"), :createdAt)
            """, nativeQuery = true)
    void insert(
            @Param("id") String id,
            @Param("nonprofitSlug") String nonprofitSlug,
            @Param("amountCents") Integer amountCents,
            @Param("frequency") String frequency,
            @Param("createdAt") Instant createdAt
    );
}
