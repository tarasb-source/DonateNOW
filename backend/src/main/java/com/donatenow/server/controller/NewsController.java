package com.donatenow.server.controller;

import com.donatenow.server.dto.NewsArticle;
import com.donatenow.server.exception.NewsNotConfiguredException;
import com.donatenow.server.exception.NewsUnavailableException;
import com.donatenow.server.service.NewsService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/news")
public class NewsController {

    private final NewsService newsService;

    public NewsController(NewsService newsService) {
        this.newsService = newsService;
    }

    @GetMapping
    public List<NewsArticle> getNews() {
        return newsService.getArticles();
    }

    @ExceptionHandler(NewsNotConfiguredException.class)
    public ResponseEntity<Map<String, String>> handleNotConfigured() {
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(Map.of("error", "News is not configured."));
    }

    @ExceptionHandler(NewsUnavailableException.class)
    public ResponseEntity<Map<String, String>> handleUnavailable() {
        return ResponseEntity.status(HttpStatus.BAD_GATEWAY).body(Map.of("error", "Could not load news."));
    }
}
