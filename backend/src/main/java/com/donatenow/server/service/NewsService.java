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
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.util.UriComponentsBuilder;
import tools.jackson.core.JacksonException;
import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.ObjectMapper;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.HashSet;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.concurrent.Executor;
import java.util.concurrent.Executors;
import java.util.concurrent.RejectedExecutionException;
import java.util.concurrent.atomic.AtomicBoolean;

@Service
public class NewsService {

    private static final Logger log = LoggerFactory.getLogger(NewsService.class);

    // The free GNews plan delays articles by 12 hours, so refreshing more often than this gains little.
    private static final Duration CACHE_TTL = Duration.ofHours(2);
    private static final Duration FAILURE_BACKOFF = Duration.ofMinutes(5);
    private static final Duration RETRY_DELAY = Duration.ofSeconds(2);
    private static final Duration CONNECT_TIMEOUT = Duration.ofSeconds(3);
    private static final Duration READ_TIMEOUT = Duration.ofSeconds(5);
    private static final int RESULTS_LIMIT = 5;
    private static final TypeReference<List<NewsArticle>> ARTICLE_LIST = new TypeReference<>() {
    };

    private final AppProperties appProperties;
    private final NewsCacheRepository cacheRepository;
    private final ObjectMapper objectMapper;
    private final RestClient restClient;
    private final Duration retryDelay;
    private final Executor refreshExecutor;
    private final Clock clock;

    private final Object lock = new Object();
    private final AtomicBoolean refreshing = new AtomicBoolean(false);
    private volatile List<NewsArticle> cachedArticles;
    private volatile Instant nextFetchAt = Instant.EPOCH;
    private volatile boolean savedCopyChecked;
    private int consecutiveFailures;

    @Autowired
    public NewsService(AppProperties appProperties, NewsCacheRepository cacheRepository, ObjectMapper objectMapper) {
        this(appProperties, cacheRepository, objectMapper,
                RestClient.builder().requestFactory(timeoutRequestFactory()).build(),
                RETRY_DELAY, backgroundExecutor(), Clock.systemUTC());
    }

    NewsService(
            AppProperties appProperties,
            NewsCacheRepository cacheRepository,
            ObjectMapper objectMapper,
            RestClient restClient,
            Duration retryDelay,
            Executor refreshExecutor,
            Clock clock
    ) {
        this.appProperties = appProperties;
        this.cacheRepository = cacheRepository;
        this.objectMapper = objectMapper;
        this.restClient = restClient;
        this.retryDelay = retryDelay;
        this.refreshExecutor = refreshExecutor;
        this.clock = clock;
    }

    private static SimpleClientHttpRequestFactory timeoutRequestFactory() {
        SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
        requestFactory.setConnectTimeout(CONNECT_TIMEOUT);
        requestFactory.setReadTimeout(READ_TIMEOUT);
        return requestFactory;
    }

    private static Executor backgroundExecutor() {
        return Executors.newSingleThreadExecutor(task -> {
            Thread thread = new Thread(task, "news-refresh");
            thread.setDaemon(true);
            return thread;
        });
    }

    // Serves whatever copy exists right away and refreshes it in the background, so a slow or
    // failing GNews never holds up visitors. Only the very first request, with no copy anywhere, waits.
    public List<NewsArticle> getArticles() {
        String apiKey = appProperties.gnewsApiKey();
        if (apiKey == null || apiKey.isBlank()) {
            throw new NewsNotConfiguredException();
        }

        if (!savedCopyChecked) {
            synchronized (lock) {
                if (!savedCopyChecked) {
                    loadSavedArticles();
                    savedCopyChecked = true;
                }
            }
        }

        List<NewsArticle> articles = cachedArticles;
        if (articles != null) {
            if (isDue()) {
                refreshInBackground(apiKey);
            }
            return articles;
        }

        synchronized (lock) {
            if (cachedArticles == null && isDue()) {
                refresh(apiKey);
            }
        }
        if (cachedArticles != null) {
            return cachedArticles;
        }
        throw new NewsUnavailableException();
    }

    private boolean isDue() {
        return !clock.instant().isBefore(nextFetchAt);
    }

    private void refreshInBackground(String apiKey) {
        if (!refreshing.compareAndSet(false, true)) {
            return;
        }
        try {
            refreshExecutor.execute(() -> {
                try {
                    synchronized (lock) {
                        if (isDue()) {
                            refresh(apiKey);
                        }
                    }
                } finally {
                    refreshing.set(false);
                }
            });
        } catch (RejectedExecutionException e) {
            refreshing.set(false);
        }
    }

    private void refresh(String apiKey) {
        Instant now = clock.instant();
        try {
            List<NewsArticle> articles = fetchWithRetry(apiKey);
            if (!articles.isEmpty()) {
                cachedArticles = articles;
                consecutiveFailures = 0;
                nextFetchAt = now.plus(CACHE_TTL);
                saveArticles(articles, now);
                return;
            }
            log.warn("GNews returned no articles");
        } catch (RestClientException e) {
            log.warn("Could not load news from GNews: {}", describe(e));
        }

        consecutiveFailures++;
        nextFetchAt = now.plus(backoffAfter(consecutiveFailures));
    }

    static Duration backoffAfter(int failures) {
        Duration wait = FAILURE_BACKOFF.multipliedBy(1L << Math.min(failures - 1, 10));
        return wait.compareTo(CACHE_TTL) < 0 ? wait : CACHE_TTL;
    }

    // Retrying only helps with timeouts and GNews outages; a 4xx (bad key, quota used up) would fail again.
    private List<NewsArticle> fetchWithRetry(String apiKey) {
        try {
            return fetchFromGNews(apiKey);
        } catch (ResourceAccessException | HttpServerErrorException e) {
            log.warn("GNews request failed, retrying once: {}", describe(e));
            try {
                Thread.sleep(retryDelay);
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
