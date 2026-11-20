package com.donatenow.server.util;

public class GeoMath {

    private static final double EARTH_RADIUS_KM = 6371;

    private GeoMath() {
    }

    public static double distanceKm(double lat1, double lng1, double lat2, double lng2) {
        double dLat = Math.toRadians(lat2 - lat1);
        double dLng = Math.toRadians(lng2 - lng1);
        double a = Math.pow(Math.sin(dLat / 2), 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) * Math.pow(Math.sin(dLng / 2), 2);
        return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(a));
    }

    public record BoundingBox(double minLat, double maxLat, boolean unbounded, double minLng, double maxLng) {
    }

    public static BoundingBox boundingBox(double lat, double lng, double radiusKm) {
        double angularRadius = radiusKm / EARTH_RADIUS_KM;
        double dLat = Math.toDegrees(angularRadius);

        double minLat = Math.max(-90, lat - dLat);
        double maxLat = Math.min(90, lat + dLat);
        if (lat + dLat >= 90 || lat - dLat <= -90) {
            return new BoundingBox(minLat, maxLat, true, 0, 0);
        }

        double dLng = Math.toDegrees(Math.asin(Math.sin(angularRadius) / Math.cos(Math.toRadians(lat))));
        boolean wraps = lng - dLng < -180 || lng + dLng > 180;

        return wraps
                ? new BoundingBox(minLat, maxLat, true, 0, 0)
                : new BoundingBox(minLat, maxLat, false, lng - dLng, lng + dLng);
    }
}
