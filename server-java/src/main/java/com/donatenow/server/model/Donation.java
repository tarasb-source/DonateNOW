package com.donatenow.server.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "\"Donation\"")
public class Donation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "\"chargeId\"")
    private String chargeId;

    @Column(name = "\"amountCents\"")
    private Integer amountCents;

    private String currency;

    protected Donation() {
    }

    public Integer getId() {
        return id;
    }

    public String getChargeId() {
        return chargeId;
    }

    public Integer getAmountCents() {
        return amountCents;
    }

    public String getCurrency() {
        return currency;
    }
}
