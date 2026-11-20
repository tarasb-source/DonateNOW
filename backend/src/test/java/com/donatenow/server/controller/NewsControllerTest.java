package com.donatenow.server.controller;

import com.donatenow.server.config.AppProperties;
import com.donatenow.server.dto.NewsArticle;
import com.donatenow.server.exception.NewsNotConfiguredException;
import com.donatenow.server.exception.NewsUnavailableException;
import com.donatenow.server.service.NewsService;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@EnableConfigurationProperties(AppProperties.class)
@WebMvcTest(NewsController.class)
class NewsControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private NewsService newsService;

    @Test
    void returnsArticles() throws Exception {
        when(newsService.getArticles()).thenReturn(List.of(
                new NewsArticle("Kyiv update", "First", "https://news.test/1", null, "2026-11-20T10:00:00Z", "Wire")));

        mockMvc.perform(get("/api/news"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].title").value("Kyiv update"))
                .andExpect(jsonPath("$[0].url").value("https://news.test/1"))
                .andExpect(jsonPath("$[0].source").value("Wire"));
    }

    @Test
    void gnewsFailureIsBadGateway() throws Exception {
        when(newsService.getArticles()).thenThrow(new NewsUnavailableException());

        mockMvc.perform(get("/api/news"))
                .andExpect(status().isBadGateway())
                .andExpect(jsonPath("$.error").value("Could not load news."));
    }

    @Test
    void missingApiKeyIsServiceUnavailable() throws Exception {
        when(newsService.getArticles()).thenThrow(new NewsNotConfiguredException());

        mockMvc.perform(get("/api/news"))
                .andExpect(status().isServiceUnavailable())
                .andExpect(jsonPath("$.error").value("News is not configured."));
    }
}
