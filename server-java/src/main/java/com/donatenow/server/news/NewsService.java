package com.donatenow.server.news;

import com.donatenow.server.config.AppProperties;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.util.UriComponentsBuilder;

import java.time.Duration;
import java.time.Instant;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
public class NewsService {

    private static final Duration CACHE_TTL = Duration.ofMinutes(30);
    private static final int RESULTS_LIMIT = 5;

    private final AppProperties appProperties;
    private final RestClient restClient = RestClient.create();

    private volatile List<NewsArticle> cachedArticles;
    private volatile Instant cachedAt = Instant.EPOCH;

    public NewsService(AppProperties appProperties) {
        this.appProperties = appProperties;
    }

    public List<NewsArticle> getArticles() {
        String apiKey = appProperties.gnewsApiKey();
        if (apiKey == null || apiKey.isBlank()) {
            throw new NewsNotConfiguredException();
        }

        if (cachedArticles != null && Instant.now().isBefore(cachedAt.plus(CACHE_TTL))) {
            return cachedArticles;
        }

        try {
            List<NewsArticle> articles = fetchFromGNews(apiKey);
            cachedArticles = articles;
            cachedAt = Instant.now();
            return articles;
        } catch (RestClientException e) {
            if (cachedArticles != null) {
                return cachedArticles;
            }
            throw new NewsUnavailableException();
        }
    }

    private List<NewsArticle> fetchFromGNews(String apiKey) {
        String url = UriComponentsBuilder.fromUriString("https://gnews.io/api/v4/search")
                .queryParam("q", "Ukraine")
                .queryParam("lang", "en")
                .queryParam("country", "us")
                .queryParam("max", "10")
                .queryParam("apikey", apiKey)
                .toUriString();

        GNewsResponse response = restClient.get().uri(url).retrieve().body(GNewsResponse.class);
        List<GNewsResponse.GNewsArticle> articles = response != null && response.articles() != null
                ? response.articles()
                : List.of();

        Set<String> seenTitles = new HashSet<>();
        return articles.stream()
                .filter(article -> seenTitles.add(normalizeTitle(article.title())))
                .limit(RESULTS_LIMIT)
                .map(article -> new NewsArticle(
                        article.title(),
                        article.description(),
                        article.url(),
                        article.image(),
                        article.publishedAt(),
                        article.source() != null ? article.source().name() : null
                ))
                .toList();
    }

    private String normalizeTitle(String title) {
        return title.toLowerCase().replaceAll("[^a-z0-9]", "");
    }
}
