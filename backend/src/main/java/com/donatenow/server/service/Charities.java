package com.donatenow.server.service;

import java.util.Map;

public class Charities {

    private static final Map<String, String> CHARITIES = Map.of(
            "united-aid-and-logistics-foundation", "Ukraine Aid Operations",
            "razom-for-ukraine", "Razom for Ukraine",
            "nova-ukraine", "Nova Ukraine",
            "unitedhelpukraine", "United Help Ukraine"
    );

    private Charities() {
    }

    public static boolean isDonatable(String slug) {
        return CHARITIES.containsKey(slug);
    }
}
