package com.donatenow.server.donation;

import org.springframework.data.jpa.repository.JpaRepository;

public interface DonationIntentRepository extends JpaRepository<DonationIntent, String> {
}
