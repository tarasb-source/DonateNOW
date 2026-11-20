package com.donatenow.server.service;

import com.donatenow.server.config.AppProperties;
import com.donatenow.server.dto.NewsArticle;
import com.donatenow.server.exception.NewsNotConfiguredException;
import com.donatenow.server.exception.NewsUnavailableException;
import com.donatenow.server.model.NewsCache;
import com.donatenow.server.repository.NewsCacheRepository;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.dao.DataAccessResourceFailureException;
import org.springframework.http.MediaType;
import org.springframework.test.web.client.ExpectedCount;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestClient;
import tools.jackson.databind.ObjectMapper;
import tools.jackson.databind.json.JsonMapper;

import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.hamcrest.Matchers.startsWith;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.client.ExpectedCount.once;
import static org.springframework.test.web.client.ExpectedCount.times;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.queryParam;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withServerError;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

class NewsServiceTest {

    private static final String GNEWS_SEARCH = "https://gnews.io/api/v4/search";
    private static final String TWO_ARTICLES = """
            {"articles": [
              {"title": "Kyiv update", "description": "First", "url": "https://news.test/1",
               "image": "https://news.test/1.jpg", "publishedAt": "2026-11-20T10:00:00Z", "source": {"name": "Wire"}},
              {"title": "Aid arrives", "description": "Second", "url": "https://news.test/2",
               "image": null, "publishedAt": "2026-11-20T09:00:00Z", "source": null}
            ]}
            """;

    private final ObjectMapper objectMapper = JsonMapper.builder().build();
    private final NewsCacheRepository cacheRepository = mock(NewsCacheRepository.class);

    // Stands in for GNews. Any request the test didn't expect fails the test.
    private MockRestServiceServer gnews;
    private RestClient restClient;

    @BeforeEach
    void setUp() {
        RestClient.Builder builder = RestClient.builder();
        gnews = MockRestServiceServer.bindTo(builder).build();
        restClient = builder.build();
    }

    @Test
    void fetchesArticlesFromGNewsAndSavesThem() {
        gnews.expect(once(), requestTo(startsWith(GNEWS_SEARCH)))
                .andExpect(queryParam("q", "Ukraine"))
                .andExpect(queryParam("apikey", "test-key"))
                .andRespond(withSuccess(TWO_ARTICLES, MediaType.APPLICATION_JSON));

        List<NewsArticle> articles = service("test-key").getArticles();

        assertThat(articles).containsExactly(
                new NewsArticle("Kyiv update", "First", "https://news.test/1", "https://news.test/1.jpg",
                        "2026-11-20T10:00:00Z", "Wire"),
                new NewsArticle("Aid arrives", "Second", "https://news.test/2", null,
                        "2026-11-20T09:00:00Z", null));

        ArgumentCaptor<NewsCache> saved = ArgumentCaptor.forClass(NewsCache.class);
        verify(cacheRepository).save(saved.capture());
        assertThat(objectMapper.readValue(saved.getValue().getArticles(), NewsArticle[].class))
                .containsExactlyElementsOf(articles);
    }

    @Test
    void dropsDuplicateAndIncompleteArticlesAndKeepsFive() {
        gnewsReturns("""
                {"articles": [
                  {"title": "Kyiv update!", "url": "https://news.test/1"},
                  {"title": "KYIV UPDATE", "url": "https://news.test/1-syndicated"},
                  {"title": null, "url": "https://news.test/no-title"},
                  {"title": "No link", "url": null},
                  {"title": "Story 2", "url": "https://news.test/2"},
                  {"title": "Story 3", "url": "https://news.test/3"},
                  {"title": "Story 4", "url": "https://news.test/4"},
                  {"title": "Story 5", "url": "https://news.test/5"},
                  {"title": "Story 6", "url": "https://news.test/6"}
                ]}
                """);

        assertThat(service("test-key").getArticles()).extracting(NewsArticle::title)
                .containsExactly("Kyiv update!", "Story 2", "Story 3", "Story 4", "Story 5");
    }

    @Test
    void repeatRequestIsServedFromCache() {
        gnewsReturns(TWO_ARTICLES);
        NewsService service = service("test-key");

        List<NewsArticle> first = service.getArticles();
        List<NewsArticle> second = service.getArticles();

        assertThat(second).isEqualTo(first);
        gnews.verify();
    }

    @Test
    void retriesOnceWhenGNewsFails() {
        gnewsFails(once());
        gnewsReturns(TWO_ARTICLES);

        assertThat(service("test-key").getArticles()).hasSize(2);
        gnews.verify();
    }

    @Test
    void failsWhenGNewsIsDownAndNothingIsSavedThenWaitsBeforeTryingAgain() {
        gnewsFails(times(2));
        NewsService service = service("test-key");

        assertThatThrownBy(service::getArticles).isInstanceOf(NewsUnavailableException.class);
        assertThatThrownBy(service::getArticles).isInstanceOf(NewsUnavailableException.class);
        gnews.verify();
    }

    @Test
    void emptyResponseCountsAsFailure() {
        gnewsReturns("""
                {"articles": []}
                """);

        assertThatThrownBy(service("test-key")::getArticles).isInstanceOf(NewsUnavailableException.class);
        verify(cacheRepository, never()).save(any());
    }

    @Test
    void freshSavedCopySkipsGNewsAfterRestart() {
        givenSavedArticles(Instant.now().minus(Duration.ofMinutes(5)));

        assertThat(service("test-key").getArticles()).extracting(NewsArticle::title).containsExactly("Saved story");
    }

    @Test
    void staleSavedCopyIsRefreshedFromGNews() {
        givenSavedArticles(Instant.now().minus(Duration.ofHours(2)));
        gnewsReturns(TWO_ARTICLES);

        assertThat(service("test-key").getArticles()).extracting(NewsArticle::title).containsExactly("Kyiv update", "Aid arrives");
    }

    @Test
    void staleSavedCopyIsServedWhenGNewsIsDown() {
        givenSavedArticles(Instant.now().minus(Duration.ofHours(2)));
        gnewsFails(times(2));

        assertThat(service("test-key").getArticles()).extracting(NewsArticle::title).containsExactly("Saved story");
    }

    @Test
    void stillServesNewsWhenDatabaseIsDown() {
        when(cacheRepository.findById(any())).thenThrow(new DataAccessResourceFailureException("db down"));
        when(cacheRepository.save(any())).thenThrow(new DataAccessResourceFailureException("db down"));
        gnewsReturns(TWO_ARTICLES);

        assertThat(service("test-key").getArticles()).hasSize(2);
    }

    @Test
    void missingApiKeyMeansNotConfigured() {
        assertThatThrownBy(service(null)::getArticles).isInstanceOf(NewsNotConfiguredException.class);
        assertThatThrownBy(service(" ")::getArticles).isInstanceOf(NewsNotConfiguredException.class);
    }

    private void gnewsReturns(String json) {
        gnews.expect(once(), requestTo(startsWith(GNEWS_SEARCH))).andRespond(withSuccess(json, MediaType.APPLICATION_JSON));
    }

    private void gnewsFails(ExpectedCount count) {
        gnews.expect(count, requestTo(startsWith(GNEWS_SEARCH))).andRespond(withServerError());
    }

    private void givenSavedArticles(Instant fetchedAt) {
        String json = objectMapper.writeValueAsString(List.of(
                new NewsArticle("Saved story", "From the database", "https://news.test/saved", null, "2026-11-19T08:00:00Z", "Wire")));
        when(cacheRepository.findById(NewsCache.SINGLETON_ID)).thenReturn(Optional.of(new NewsCache(json, fetchedAt)));
    }

    private NewsService service(String apiKey) {
        AppProperties properties = new AppProperties(List.of(), "https://donatenow.test", apiKey,
                new AppProperties.EveryOrg("https://www.every.org", "", ""));
        return new NewsService(properties, cacheRepository, objectMapper, restClient, Duration.ZERO);
    }
}
