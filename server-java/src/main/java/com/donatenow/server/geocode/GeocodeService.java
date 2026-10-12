package com.donatenow.server.geocode;

import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.util.UriComponentsBuilder;

import java.time.Duration;
import java.time.Instant;
import java.util.Iterator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class GeocodeService {

    private static final String USER_AGENT = "DonateNOW/1.0 (+https://github.com/tarasb-source/DonateNOW)";
    private static final Duration MIN_INTERVAL = Duration.ofMillis(1100);
    private static final int MAX_CACHE_ENTRIES = 500;

    private final RestClient restClient = RestClient.create();
    private final Map<String, Place> cache = new LinkedHashMap<>();
    private Instant lastCallAt = Instant.EPOCH;

    public synchronized Place geocode(String query) {
        String key = query.toLowerCase();
        if (cache.containsKey(key)) {
            return cache.get(key);
        }

        throttle();
        Place place = fetchFromNominatim(query);

        if (cache.size() >= MAX_CACHE_ENTRIES) {
            Iterator<String> oldest = cache.keySet().iterator();
            oldest.next();
            oldest.remove();
        }
        cache.put(key, place);
        return place;
    }

    private Place fetchFromNominatim(String query) {
        String url = UriComponentsBuilder.fromUriString("https://nominatim.openstreetmap.org/search")
                .queryParam("q", query)
                .queryParam("format", "jsonv2")
                .queryParam("limit", "1")
                .queryParam("accept-language", "en")
                .toUriString();

        List<NominatimResult> results = restClient.get()
                .uri(url)
                .header("User-Agent", USER_AGENT)
                .retrieve()
                .body(new ParameterizedTypeReference<List<NominatimResult>>() {
                });

        if (results == null || results.isEmpty()) {
            return null;
        }

        NominatimResult result = results.get(0);
        return new Place(result.displayName(), Double.parseDouble(result.lat()), Double.parseDouble(result.lon()));
    }

    private void throttle() {
        Duration sinceLastCall = Duration.between(lastCallAt, Instant.now());
        if (sinceLastCall.compareTo(MIN_INTERVAL) < 0) {
            sleep(MIN_INTERVAL.minus(sinceLastCall));
        }
        lastCallAt = Instant.now();
    }

    private void sleep(Duration duration) {
        try {
            Thread.sleep(duration.toMillis());
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }
}
