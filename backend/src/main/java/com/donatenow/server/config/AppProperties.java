package com.donatenow.server.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.util.List;

@ConfigurationProperties(prefix = "app")
public record AppProperties(
        List<String> clientOrigins,
        String publicSiteUrl,
        String gnewsApiKey,
        EveryOrg everyOrg
) {
    public record EveryOrg(String baseUrl, String webhookToken, String webhookSecret) {
    }
}
