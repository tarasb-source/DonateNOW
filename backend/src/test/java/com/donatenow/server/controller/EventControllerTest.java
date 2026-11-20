package com.donatenow.server.controller;

import com.donatenow.server.config.AppProperties;
import com.donatenow.server.model.Event;
import com.donatenow.server.repository.EventRepository;
import com.donatenow.server.util.GeoMath;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.data.domain.PageRequest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Duration;
import java.time.Instant;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.contains;
import static org.hamcrest.Matchers.nullValue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyBoolean;
import static org.mockito.ArgumentMatchers.anyDouble;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@EnableConfigurationProperties(AppProperties.class)
@WebMvcTest(EventController.class)
class EventControllerTest {

    private static final Instant TOMORROW = Instant.now().plus(Duration.ofDays(1));

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private EventRepository repository;

    @Test
    void withoutLocationListsUpcomingEventsWithoutDistance() throws Exception {
        when(repository.findUpcoming(any(), any(), eq(PageRequest.of(0, 200))))
                .thenReturn(List.of(event("Concert in Kyiv", 50.45, 30.52, TOMORROW)));

        mockMvc.perform(get("/api/events"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[*].title", contains("Concert in Kyiv")))
                .andExpect(jsonPath("$[0].distanceKm").value(nullValue()));
    }

    @Test
    void eventsWithoutEndTimeCountAsOngoingForSixHours() throws Exception {
        mockMvc.perform(get("/api/events")).andExpect(status().isOk());

        ArgumentCaptor<Instant> now = ArgumentCaptor.forClass(Instant.class);
        ArgumentCaptor<Instant> ongoingCutoff = ArgumentCaptor.forClass(Instant.class);
        verify(repository).findUpcoming(now.capture(), ongoingCutoff.capture(), any());
        assertThat(Duration.between(ongoingCutoff.getValue(), now.getValue())).isEqualTo(Duration.ofHours(6));
    }

    @Test
    void nearbySearchQueriesBoundingBoxAroundLocation() throws Exception {
        mockMvc.perform(get("/api/events").param("lat", "40.7128").param("lng", "-74.0060").param("radius", "100"))
                .andExpect(status().isOk());

        GeoMath.BoundingBox box = GeoMath.boundingBox(40.7128, -74.0060, 100);
        verify(repository).findUpcomingInBoundingBox(any(), any(),
                eq(box.minLat()), eq(box.maxLat()), eq(false), eq(box.minLng()), eq(box.maxLng()));
    }

    @Test
    void radiusDefaultsToOneHundredKm() throws Exception {
        mockMvc.perform(get("/api/events").param("lat", "0").param("lng", "0"))
                .andExpect(status().isOk());

        GeoMath.BoundingBox box = GeoMath.boundingBox(0, 0, 100);
        verify(repository).findUpcomingInBoundingBox(any(), any(),
                eq(box.minLat()), eq(box.maxLat()), eq(false), eq(box.minLng()), eq(box.maxLng()));
    }

    @Test
    void nearbySearchDropsEventsOutsideRadiusAndSortsByDistanceThenStart() throws Exception {
        // Distances from New York (40.7128, -74.0060), worked out independently.
        when(repository.findUpcomingInBoundingBox(any(), any(), anyDouble(), anyDouble(), anyBoolean(), anyDouble(), anyDouble()))
                .thenReturn(List.of(
                        event("120 km away (inside the box, outside the radius)", 41.55, -73.10, TOMORROW),
                        event("76.4 km away", 41.40, -74.00, TOMORROW),
                        event("9.7 km away, later", 40.80, -74.00, TOMORROW.plus(Duration.ofDays(2))),
                        event("9.7 km away, sooner", 40.80, -74.00, TOMORROW)
                ));

        mockMvc.perform(get("/api/events").param("lat", "40.7128").param("lng", "-74.0060").param("radius", "100"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[*].title", contains("9.7 km away, sooner", "9.7 km away, later", "76.4 km away")))
                .andExpect(jsonPath("$[*].distanceKm", contains(9.7, 9.7, 76.4)));
    }

    @Test
    void latAndLngMustComeTogether() throws Exception {
        mockMvc.perform(get("/api/events").param("lat", "40.7"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("lat and lng must be provided together"));

        verifyNoInteractions(repository);
    }

    @ParameterizedTest
    @ValueSource(strings = {
            "lat=91&lng=0",
            "lat=0&lng=-181",
            "lat=0&lng=0&radius=0",
            "lat=0&lng=0&radius=20001",
            "lat=north&lng=0"
    })
    void rejectsInvalidSearchParameters(String query) throws Exception {
        mockMvc.perform(get("/api/events?" + query))
                .andExpect(status().isBadRequest());

        verifyNoInteractions(repository);
    }

    private static Event event(String title, double latitude, double longitude, Instant startsAt) {
        Event event = new Event();
        ReflectionTestUtils.setField(event, "title", title);
        ReflectionTestUtils.setField(event, "latitude", latitude);
        ReflectionTestUtils.setField(event, "longitude", longitude);
        ReflectionTestUtils.setField(event, "startsAt", startsAt);
        return event;
    }
}
