package com.donatenow.server.news;

import java.util.List;

public record GNewsResponse(List<GNewsArticle> articles) {

    public record GNewsArticle(
            String title,
            String description,
            String url,
            String image,
            String publishedAt,
            GNewsSource source
    ) {
    }

    public record GNewsSource(String name) {
    }
}
