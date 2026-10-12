package com.donatenow.server.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record NominatimResult(
        @JsonProperty("display_name") String displayName,
        String lat,
        String lon
) {
}
