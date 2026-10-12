package com.donatenow.server.repository;

import com.donatenow.server.dto.DonationTotals;
import com.donatenow.server.model.Donation;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Optional;

public interface DonationRepository extends JpaRepository<Donation, Integer> {

    Optional<Donation> findByChargeId(String chargeId);

    @Query("""
            SELECT new com.donatenow.server.dto.DonationTotals(COALESCE(SUM(d.amountCents), 0), COUNT(d))
            FROM Donation d
            WHERE d.currency = 'USD'
            """)
    DonationTotals totalsForUsd();

    @Transactional
    @Modifying
    @Query(value = """
            INSERT INTO "Donation"
                ("chargeId", "intentId", "nonprofitSlug", "nonprofitName", "amountCents", "netAmountCents", currency, frequency, "donatedAt", "createdAt")
            VALUES
                (:chargeId, :intentId, :nonprofitSlug, :nonprofitName, :amountCents, :netAmountCents, :currency, CAST(:frequency AS "DonationFrequency"), :donatedAt, :createdAt)
            """, nativeQuery = true)
    void insert(
            @Param("chargeId") String chargeId,
            @Param("intentId") String intentId,
            @Param("nonprofitSlug") String nonprofitSlug,
            @Param("nonprofitName") String nonprofitName,
            @Param("amountCents") Integer amountCents,
            @Param("netAmountCents") Integer netAmountCents,
            @Param("currency") String currency,
            @Param("frequency") String frequency,
            @Param("donatedAt") Instant donatedAt,
            @Param("createdAt") Instant createdAt
    );
}
