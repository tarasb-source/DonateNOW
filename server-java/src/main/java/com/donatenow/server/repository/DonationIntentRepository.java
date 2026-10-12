package com.donatenow.server.repository;

import com.donatenow.server.model.DonationIntent;

import org.springframework.data.jpa.repository.JpaRepository;

public interface DonationIntentRepository extends JpaRepository<DonationIntent, String> {
}
