package com.donatenow.server.util;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.within;

class GeoMathTest {

    private static final double EARTH_RADIUS_KM = 6371;
    // Points due north/south land exactly on the box edge, so allow for floating-point rounding (~0.1 mm).
    private static final double ROUNDING = 1e-9;

    // Expected distances were worked out independently with the haversine formula.
    @Test
    void distanceMatchesKnownCityPairs() {
        assertThat(GeoMath.distanceKm(40.7128, -74.0060, 39.9526, -75.1652))
                .as("New York to Philadelphia").isCloseTo(129.61, within(0.01));
        assertThat(GeoMath.distanceKm(50.4501, 30.5234, 49.8397, 24.0297))
                .as("Kyiv to Lviv").isCloseTo(467.53, within(0.01));
    }

    @Test
    void distanceToSamePointIsZero() {
        assertThat(GeoMath.distanceKm(50.45, 30.52, 50.45, 30.52)).isZero();
    }

    @Test
    void distanceAcrossDatelineTakesShortWay() {
        assertThat(GeoMath.distanceKm(0, 179.5, 0, -179.5)).isCloseTo(111.19, within(0.01));
    }

    @Test
    void boxCrossingDatelineSearchesAllLongitudes() {
        assertThat(GeoMath.boundingBox(-17.7, 179.5, 100).unbounded()).isTrue();
    }

    @Test
    void boxNearPoleIsClampedAndSearchesAllLongitudes() {
        GeoMath.BoundingBox box = GeoMath.boundingBox(89.99, 10, 100);

        assertThat(box.maxLat()).isEqualTo(90);
        assertThat(box.unbounded()).isTrue();
    }

    // Every event within the radius must survive the database's bounding-box filter,
    // so every point exactly on the search circle has to fall inside the box.
    @ParameterizedTest(name = "{0}, {1} with {2} km radius")
    @CsvSource({
            "0, 0, 100",
            "40.7128, -74.0060, 100",
            "50.4501, 30.5234, 500",
            "-33.8688, 151.2093, 50",
            "64.1466, -21.9426, 300"
    })
    void boxContainsEveryPointOnTheSearchCircle(double lat, double lng, double radiusKm) {
        GeoMath.BoundingBox box = GeoMath.boundingBox(lat, lng, radiusKm);

        for (int bearing = 0; bearing < 360; bearing += 5) {
            double[] point = pointOnCircle(lat, lng, bearing, radiusKm);

            assertThat(point[0]).as("latitude at bearing %d°", bearing)
                    .isBetween(box.minLat() - ROUNDING, box.maxLat() + ROUNDING);
            if (!box.unbounded()) {
                assertThat(point[1]).as("longitude at bearing %d°", bearing)
                        .isBetween(box.minLng() - ROUNDING, box.maxLng() + ROUNDING);
            }
        }
    }

    // Standard great-circle "destination point" formula.
    private static double[] pointOnCircle(double lat, double lng, double bearingDegrees, double distanceKm) {
        double angular = distanceKm / EARTH_RADIUS_KM;
        double bearing = Math.toRadians(bearingDegrees);
        double lat1 = Math.toRadians(lat);
        double lng1 = Math.toRadians(lng);

        double lat2 = Math.asin(Math.sin(lat1) * Math.cos(angular) + Math.cos(lat1) * Math.sin(angular) * Math.cos(bearing));
        double lng2 = lng1 + Math.atan2(
                Math.sin(bearing) * Math.sin(angular) * Math.cos(lat1),
                Math.cos(angular) - Math.sin(lat1) * Math.sin(lat2));
        return new double[]{Math.toDegrees(lat2), Math.toDegrees(lng2)};
    }
}
