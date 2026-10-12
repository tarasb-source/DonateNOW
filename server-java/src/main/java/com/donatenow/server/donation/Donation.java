package com.donatenow.server.donation;

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
@Table(name = "\"Donation\"")
public class Donation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "\"chargeId\"")
    private String chargeId;

    @Column(name = "\"intentId\"")
    private String intentId;

    @Column(name = "\"nonprofitSlug\"")
    private String nonprofitSlug;

    @Column(name = "\"nonprofitName\"")
    private String nonprofitName;

    @Column(name = "\"amountCents\"")
    private Integer amountCents;

    @Column(name = "\"netAmountCents\"")
    private Integer netAmountCents;

    private String currency;

    @Enumerated(EnumType.STRING)
    private DonationFrequency frequency;

    @Column(name = "\"donatedAt\"")
    private Instant donatedAt;

    @Column(name = "\"createdAt\"")
    private Instant createdAt = Instant.now();

    protected Donation() {
    }

    public Donation(
            String chargeId,
            String intentId,
            String nonprofitSlug,
            String nonprofitName,
            Integer amountCents,
            Integer netAmountCents,
            String currency,
            DonationFrequency frequency,
            Instant donatedAt
    ) {
        this.chargeId = chargeId;
        this.intentId = intentId;
        this.nonprofitSlug = nonprofitSlug;
        this.nonprofitName = nonprofitName;
        this.amountCents = amountCents;
        this.netAmountCents = netAmountCents;
        this.currency = currency;
        this.frequency = frequency;
        this.donatedAt = donatedAt;
    }
}
