package com.donatenow.server.service;

import com.donatenow.server.config.AppProperties;
import com.donatenow.server.dto.GNewsResponse;
import com.donatenow.server.dto.NewsArticle;
import com.donatenow.server.exception.NewsNotConfiguredException;
import com.donatenow.server.exception.NewsUnavailableException;
import com.donatenow.server.model.NewsCache;
import com.donatenow.server.repository.NewsCacheRepository;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataAccessException;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.util.UriComponentsBuilder;
import tools.jackson.core.JacksonException;
import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.ObjectMapper;

import java.time.Duration;
import java.time.Instant;
import java.util.HashSet;
import java.util.List;
import java.util.Objects;
import java.util.Set;

@Service
public class NewsService {

    private static final Logger log = LoggerFactory.getLogger(NewsService.class);

    private static final Duration CACHE_TTL = Duration.ofMinutes(30);
    private static final Duration FAILURE_BACKOFF = Duration.ofMinutes(5);
    private static final Duration RETRY_DELAY = Duration.ofSeconds(2);
    private static final Duration GNEWS_TIMEOUT = Duration.ofSeconds(10);
    private static final int RESULTS_LIMIT = 5;
    private static final TypeReference<List<NewsArticle>> ARTICLE_LIST = new TypeReference<>() {
    };

    private final AppProperties appProperties;
    private final NewsCacheRepository cacheRepository;
    private final ObjectMapper objectMapper;
    private final RestClient restClient;

    private List<NewsArticle> cachedArticles;
    private Instant nextFetchAt = Instant.EPOCH;

    public NewsService(AppProperties appProperties, NewsCacheRepository cacheRepository, ObjectMapper objectMapper) {
        this.appProperties = appProperties;
        this.cacheRepository = cacheRepository;
        this.objectMapper = objectMapper;

        SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
        requestFactory.setConnectTimeout(GNEWS_TIMEOUT);
        requestFactory.setReadTimeout(GNEWS_TIMEOUT);
        this.restClient = RestClient.builder().requestFactory(requestFactory).build();
    }

    public synchronized List<NewsArticle> getArticles() {
        String apiKey = appProperties.gnewsApiKey();
        if (apiKey == null || apiKey.isBlank()) {
            throw new NewsNotConfiguredException();
        }

        if (cachedArticles == null) {
            loadSavedArticles();
        }

        Instant now = Instant.now();
        if (now.isBefore(nextFetchAt)) {
            if (cachedArticles != null) {
                return cachedArticles;
            }
            throw new NewsUnavailableException();
        }

        try {
            List<NewsArticle> articles = fetchWithRetry(apiKey);
            if (!articles.isEmpty()) {
                cachedArticles = articles;
                nextFetchAt = now.plus(CACHE_TTL);
                saveArticles(articles, now);
                return articles;
            }
            log.warn("GNews returned no articles");
        } catch (RestClientException e) {
            log.warn("Could not load news from GNews: {}", describe(e));
        }

        nextFetchAt = now.plus(FAILURE_BACKOFF);
        if (cachedArticles != null) {
            return cachedArticles;
        }
        throw new NewsUnavailableException();
    }

    private List<NewsArticle> fetchWithRetry(String apiKey) {
        try {
            return fetchFromGNews(apiKey);
        } catch (RestClientException e) {
            log.warn("GNews request failed, retrying once: {}", describe(e));
            try {
                Thread.sleep(RETRY_DELAY);
            } catch (InterruptedException interrupted) {
                Thread.currentThread().interrupt();
                throw e;
            }
            return fetchFromGNews(apiKey);
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
                .filter(article -> article.title() != null && article.url() != null)
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

    private void loadSavedArticles() {
        try {
            cacheRepository.findById(NewsCache.SINGLETON_ID).ifPresent(saved -> {
                List<NewsArticle> articles = objectMapper.readValue(saved.getArticles(), ARTICLE_LIST);
                if (!articles.isEmpty()) {
                    cachedArticles = articles;
                    nextFetchAt = saved.getFetchedAt().plus(CACHE_TTL);
                }
            });
        } catch (DataAccessException | JacksonException e) {
            log.warn("Could not read saved news: {}", e.getClass().getSimpleName());
        }
    }

    private void saveArticles(List<NewsArticle> articles, Instant fetchedAt) {
        try {
            cacheRepository.save(new NewsCache(objectMapper.writeValueAsString(articles), fetchedAt));
        } catch (DataAccessException | JacksonException e) {
            log.warn("Could not save news: {}", e.getClass().getSimpleName());
        }
    }

    // The exception message contains the request URL, which includes the API key, so it is never logged.
    private String describe(RestClientException e) {
        if (e instanceof RestClientResponseException responseException) {
            return "HTTP " + responseException.getStatusCode().value();
        }
        return Objects.requireNonNull(e.getMostSpecificCause()).getClass().getSimpleName();
    }

    private String normalizeTitle(String title) {
        return title.toLowerCase().replaceAll("[^a-z0-9]", "");
    }
}
