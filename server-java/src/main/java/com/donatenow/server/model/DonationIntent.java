package com.donatenow.server.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "\"DonationIntent\"")
public class DonationIntent {

    @Id
    private String id;

    protected DonationIntent() {
    }

    public String getId() {
        return id;
    }
}
