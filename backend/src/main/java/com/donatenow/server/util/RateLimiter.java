package com.donatenow.server.util;

import java.time.Duration;
import java.time.Instant;
import java.util.Deque;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentLinkedDeque;

public class RateLimiter {

    private final int limit;
    private final Duration window;
    private final Map<String, Deque<Instant>> hitsByKey = new ConcurrentHashMap<>();

    public RateLimiter(int limit, Duration window) {
        this.limit = limit;
        this.window = window;
    }

    public boolean tryAcquire(String key) {
        Deque<Instant> hits = hitsByKey.computeIfAbsent(key, k -> new ConcurrentLinkedDeque<>());
        Instant cutoff = Instant.now().minus(window);

        synchronized (hits) {
            while (!hits.isEmpty() && hits.peekFirst().isBefore(cutoff)) {
                hits.pollFirst();
            }
            if (hits.size() >= limit) {
                return false;
            }
            hits.addLast(Instant.now());
            return true;
        }
    }
}
