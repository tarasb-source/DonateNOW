package com.donatenow.server.repository;

import com.donatenow.server.model.ContactMessage;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ContactMessageRepository extends JpaRepository<ContactMessage, Integer> {
}
