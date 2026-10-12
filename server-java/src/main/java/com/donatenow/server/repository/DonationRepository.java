package com.donatenow.server.repository;

import com.donatenow.server.dto.DonationTotals;
import com.donatenow.server.model.Donation;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface DonationRepository extends JpaRepository<Donation, Integer> {

    Optional<Donation> findByChargeId(String chargeId);

    @Query("""
            SELECT new com.donatenow.server.dto.DonationTotals(COALESCE(SUM(d.amountCents), 0), COUNT(d))
            FROM Donation d
            WHERE d.currency = 'USD'
            """)
    DonationTotals totalsForUsd();
}
