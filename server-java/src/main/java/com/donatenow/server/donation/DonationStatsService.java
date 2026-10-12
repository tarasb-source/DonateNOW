package com.donatenow.server.donation;

import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;

@Service
public class DonationStatsService {

    private static final Duration CACHE_TTL = Duration.ofSeconds(60);

    private final DonationRepository donationRepository;
    private volatile DonationStats cached;
    private volatile Instant cachedAt = Instant.EPOCH;

    public DonationStatsService(DonationRepository donationRepository) {
        this.donationRepository = donationRepository;
    }

    public synchronized DonationStats getStats() {
        if (cached != null && Instant.now().isBefore(cachedAt.plus(CACHE_TTL))) {
            return cached;
        }

        DonationTotals totals = donationRepository.totalsForUsd();
        cached = new DonationStats(totals.totalCents() / 100.0, totals.count());
        cachedAt = Instant.now();
        return cached;
    }

    public void invalidate() {
        cachedAt = Instant.EPOCH;
    }
}
