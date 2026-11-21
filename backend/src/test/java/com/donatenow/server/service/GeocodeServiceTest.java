package com.donatenow.server.service;

import com.donatenow.server.dto.Place;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestClient;

import java.net.URI;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.startsWith;
import static org.springframework.test.web.client.ExpectedCount.once;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

class GeocodeServiceTest {

    private static final String NEW_YORK = """
            [{"display_name": "New York, United States", "lat": "40.7127281", "lon": "-74.0060152"}]
            """;

    // Stands in for Nominatim. Any request the test didn't expect fails the test.
    private MockRestServiceServer nominatim;
    private GeocodeService service;

    @BeforeEach
    void setUp() {
        RestClient.Builder builder = RestClient.builder();
        nominatim = MockRestServiceServer.bindTo(builder).build();
        service = new GeocodeService(builder.build());
    }

    @Test
    void encodesSpacesInCityNamesOnce() {
        nominatim.expect(once(), requestTo(URI.create(
                        "https://nominatim.openstreetmap.org/search?q=New%20York&format=jsonv2&limit=1&accept-language=en")))
                .andRespond(withSuccess(NEW_YORK, MediaType.APPLICATION_JSON));

        assertThat(service.geocode("New York")).isEqualTo(new Place("New York, United States", 40.7127281, -74.0060152));
        nominatim.verify();
    }

    @Test
    void repeatLookupIsServedFromCache() {
        nominatim.expect(once(), requestTo(startsWith("https://nominatim.openstreetmap.org/search")))
                .andRespond(withSuccess(NEW_YORK, MediaType.APPLICATION_JSON));

        service.geocode("New York");
        assertThat(service.geocode("new york")).isNotNull();
        nominatim.verify();
    }

    @Test
    void failedLookupIsNotCached() {
        nominatim.expect(once(), requestTo(startsWith("https://nominatim.openstreetmap.org/search")))
                .andRespond(withSuccess("[]", MediaType.APPLICATION_JSON));
        nominatim.expect(once(), requestTo(startsWith("https://nominatim.openstreetmap.org/search")))
                .andRespond(withSuccess(NEW_YORK, MediaType.APPLICATION_JSON));

        assertThat(service.geocode("New York")).isNull();
        assertThat(service.geocode("New York")).isNotNull();
        nominatim.verify();
    }
}
