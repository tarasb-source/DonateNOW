package com.donatenow.server.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.Instant;

@Entity
@Table(name = "\"ContactMessage\"")
public class ContactMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private String name;
    private String email;
    private String message;
    private boolean newsletter;

    @Column(name = "\"createdAt\"")
    private Instant createdAt = Instant.now();

    protected ContactMessage() {
    }

    public ContactMessage(String name, String email, String message, boolean newsletter) {
        this.name = name;
        this.email = email;
        this.message = message;
        this.newsletter = newsletter;
    }
}
