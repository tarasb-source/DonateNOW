package com.donatenow.server.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.Instant;

@Entity
@Table(name = "\"DonationIntent\"")
public class DonationIntent {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(name = "\"nonprofitSlug\"")
    private String nonprofitSlug;

    @Column(name = "\"amountCents\"")
    private Integer amountCents;

    @Enumerated(EnumType.STRING)
    private DonationFrequency frequency;

    @Column(name = "\"createdAt\"")
    private Instant createdAt = Instant.now();

    protected DonationIntent() {
    }

    public DonationIntent(String nonprofitSlug, Integer amountCents, DonationFrequency frequency) {
        this.nonprofitSlug = nonprofitSlug;
        this.amountCents = amountCents;
        this.frequency = frequency;
    }

    public String getId() {
        return id;
    }
}
