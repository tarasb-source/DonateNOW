package com.donatenow.server.dto;

public record NewsArticle(
        String title,
        String description,
        String url,
        String image,
        String publishedAt,
        String source
) {
}
