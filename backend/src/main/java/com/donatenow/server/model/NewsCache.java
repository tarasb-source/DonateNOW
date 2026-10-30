package com.donatenow.server.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.Instant;

@Entity
@Table(name = "\"NewsCache\"")
public class NewsCache {

    public static final int SINGLETON_ID = 1;

    @Id
    private Integer id = SINGLETON_ID;

    private String articles;

    @Column(name = "\"fetchedAt\"")
    private Instant fetchedAt;

    protected NewsCache() {
    }

    public NewsCache(String articles, Instant fetchedAt) {
        this.articles = articles;
        this.fetchedAt = fetchedAt;
    }

    public String getArticles() {
        return articles;
    }

    public Instant getFetchedAt() {
        return fetchedAt;
    }
}
