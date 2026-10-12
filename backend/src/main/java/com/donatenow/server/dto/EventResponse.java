package com.donatenow.server.dto;

import com.donatenow.server.model.Event;
import com.donatenow.server.model.EventStatus;

import java.time.Instant;

public record EventResponse(
        Integer id,
        String title,
        String organization,
        String description,
        String category,
        String link,
        Instant startsAt,
        Instant endsAt,
        String address,
        String city,
        String country,
        double latitude,
        double longitude,
        EventStatus status,
        String source,
        String sourceId,
        Instant createdAt,
        Instant updatedAt,
        Double distanceKm
) {
    public static EventResponse of(Event event, Double distanceKm) {
        return new EventResponse(
                event.getId(),
                event.getTitle(),
                event.getOrganization(),
                event.getDescription(),
                event.getCategory(),
                event.getLink(),
                event.getStartsAt(),
                event.getEndsAt(),
                event.getAddress(),
                event.getCity(),
                event.getCountry(),
                event.getLatitude(),
                event.getLongitude(),
                event.getStatus(),
                event.getSource(),
                event.getSourceId(),
                event.getCreatedAt(),
                event.getUpdatedAt(),
                distanceKm
        );
    }
}
