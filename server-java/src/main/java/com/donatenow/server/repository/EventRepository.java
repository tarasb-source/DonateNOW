package com.donatenow.server.repository;

import com.donatenow.server.model.Event;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;

public interface EventRepository extends JpaRepository<Event, Integer> {

    @Query("""
            SELECT e FROM Event e
            WHERE e.status = com.donatenow.server.model.EventStatus.APPROVED
            AND (e.endsAt >= :now OR (e.endsAt IS NULL AND e.startsAt >= :ongoingCutoff))
            ORDER BY e.startsAt ASC
            """)
    List<Event> findUpcoming(@Param("now") Instant now, @Param("ongoingCutoff") Instant ongoingCutoff, Pageable pageable);

    @Query("""
            SELECT e FROM Event e
            WHERE e.status = com.donatenow.server.model.EventStatus.APPROVED
            AND (e.endsAt >= :now OR (e.endsAt IS NULL AND e.startsAt >= :ongoingCutoff))
            AND e.latitude BETWEEN :minLat AND :maxLat
            AND (:unbounded = TRUE OR e.longitude BETWEEN :minLng AND :maxLng)
            """)
    List<Event> findUpcomingInBoundingBox(
            @Param("now") Instant now,
            @Param("ongoingCutoff") Instant ongoingCutoff,
            @Param("minLat") double minLat,
            @Param("maxLat") double maxLat,
            @Param("unbounded") boolean unbounded,
            @Param("minLng") double minLng,
            @Param("maxLng") double maxLng
    );
}
