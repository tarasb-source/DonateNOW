package com.donatenow.server.repository;

import com.donatenow.server.model.NewsCache;

import org.springframework.data.jpa.repository.JpaRepository;

public interface NewsCacheRepository extends JpaRepository<NewsCache, Integer> {
}
