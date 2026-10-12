package com.donatenow.server.news;

public record NewsArticle(
        String title,
        String description,
        String url,
        String image,
        String publishedAt,
        String source
) {
}
