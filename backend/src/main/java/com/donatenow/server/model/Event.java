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
@Table(name = "\"Event\"")
public class Event {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private String title;
    private String organization;
    private String description;
    private String category;
    private String link;

    @Column(name = "\"startsAt\"")
    private Instant startsAt;

    @Column(name = "\"endsAt\"")
    private Instant endsAt;

    private String address;
    private String city;
    private String country;
    private double latitude;
    private double longitude;

    @Enumerated(EnumType.STRING)
    private EventStatus status;

    private String source;

    @Column(name = "\"sourceId\"")
    private String sourceId;

    @Column(name = "\"createdAt\"")
    private Instant createdAt;

    @Column(name = "\"updatedAt\"")
    private Instant updatedAt;

    public Integer getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public String getOrganization() {
        return organization;
    }

    public String getDescription() {
        return description;
    }

    public String getCategory() {
        return category;
    }

    public String getLink() {
        return link;
    }

    public Instant getStartsAt() {
        return startsAt;
    }

    public Instant getEndsAt() {
        return endsAt;
    }

    public String getAddress() {
        return address;
    }

    public String getCity() {
        return city;
    }

    public String getCountry() {
        return country;
    }

    public double getLatitude() {
        return latitude;
    }

    public double getLongitude() {
        return longitude;
    }

    public EventStatus getStatus() {
        return status;
    }

    public String getSource() {
        return source;
    }

    public String getSourceId() {
        return sourceId;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }
}
