package com.donatenow.server.controller;

import com.donatenow.server.dto.Place;
import com.donatenow.server.exception.RateLimitExceededException;
import com.donatenow.server.service.GeocodeService;
import com.donatenow.server.util.ClientIp;
import com.donatenow.server.util.RateLimiter;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.constraints.Size;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.Duration;
import java.util.Map;

@RestController
@RequestMapping("/api/geocode")
@Validated
public class GeocodeController {

    private final GeocodeService geocodeService;
    private final RateLimiter rateLimiter = new RateLimiter(20, Duration.ofMinutes(1));

    public GeocodeController(GeocodeService geocodeService) {
        this.geocodeService = geocodeService;
    }

    @GetMapping
    public ResponseEntity<Object> geocode(@RequestParam @Size(min = 2, max = 200) String q, HttpServletRequest request) {
        if (!rateLimiter.tryAcquire(ClientIp.resolve(request))) {
            throw new RateLimitExceededException("Too many searches. Please wait a minute and try again.");
        }

        Place place = geocodeService.geocode(q.trim());
        if (place == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "We couldn't find that place."));
        }
        return ResponseEntity.ok(place);
    }
}
