package com.donatenow.server.donation;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface DonationRepository extends JpaRepository<Donation, Integer> {

    Optional<Donation> findByChargeId(String chargeId);

    @Query("""
            SELECT new com.donatenow.server.donation.DonationTotals(COALESCE(SUM(d.amountCents), 0), COUNT(d))
            FROM Donation d
            WHERE d.currency = 'USD'
            """)
    DonationTotals totalsForUsd();
}
