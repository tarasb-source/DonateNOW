package com.donatenow.server.event;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.Duration;
import java.time.Instant;
import java.util.Comparator;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/events")
@Validated
public class EventController {

    private static final Duration ONGOING_GRACE = Duration.ofHours(6);
    private static final int MAX_RESULTS = 200;

    private final EventRepository repository;

    public EventController(EventRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public ResponseEntity<Object> getEvents(
            @RequestParam(required = false) @DecimalMin("-90") @DecimalMax("90") Double lat,
            @RequestParam(required = false) @DecimalMin("-180") @DecimalMax("180") Double lng,
            @RequestParam(defaultValue = "100") @DecimalMin("1") @DecimalMax("20000") double radius
    ) {
        if ((lat == null) != (lng == null)) {
            return ResponseEntity.badRequest().body(Map.of("error", "lat and lng must be provided together"));
        }

        Instant now = Instant.now();
        Instant ongoingCutoff = now.minus(ONGOING_GRACE);

        if (lat == null) {
            List<Event> events = repository.findUpcoming(now, ongoingCutoff, PageRequest.of(0, MAX_RESULTS));
            return ResponseEntity.ok(events.stream().map(event -> EventResponse.of(event, null)).toList());
        }

        GeoMath.BoundingBox box = GeoMath.boundingBox(lat, lng, radius);
        List<Event> candidates = repository.findUpcomingInBoundingBox(
                now, ongoingCutoff, box.minLat(), box.maxLat(), box.unbounded(), box.minLng(), box.maxLng()
        );

        List<EventResponse> events = candidates.stream()
                .map(event -> Map.entry(event, roundToOneDecimal(GeoMath.distanceKm(lat, lng, event.getLatitude(), event.getLongitude()))))
                .filter(entry -> entry.getValue() <= radius)
                .sorted(Comparator.<Map.Entry<Event, Double>>comparingDouble(Map.Entry::getValue)
                        .thenComparing(entry -> entry.getKey().getStartsAt()))
                .limit(MAX_RESULTS)
                .map(entry -> EventResponse.of(entry.getKey(), entry.getValue()))
                .toList();

        return ResponseEntity.ok(events);
    }

    private double roundToOneDecimal(double value) {
        return Math.round(value * 10) / 10.0;
    }
}
