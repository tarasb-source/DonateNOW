const EARTH_RADIUS_KM = 6371;
const KM_PER_DEGREE_LAT = 111.32;
const toRadians = (degrees) => (degrees * Math.PI) / 180;

// Great-circle distance between two points.
export function distanceKm(lat1, lng1, lat2, lng2) {
    const dLat = toRadians(lat2 - lat1);
    const dLng = toRadians(lng2 - lng1);
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLng / 2) ** 2;
    return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(a));
}

// A lat/lng box that contains every point within radiusKm, for a cheap indexed pre-filter.
// Returns null for the longitude range when the box would wrap past ±180° or a pole.
export function boundingBox(lat, lng, radiusKm) {
    const dLat = radiusKm / KM_PER_DEGREE_LAT;
    const cosLat = Math.cos(toRadians(lat));
    const dLng = cosLat > 0.01 ? radiusKm / (KM_PER_DEGREE_LAT * cosLat) : 360;

    const latitude = { gte: Math.max(-90, lat - dLat), lte: Math.min(90, lat + dLat) };
    const wraps = lng - dLng < -180 || lng + dLng > 180;
    const longitude = wraps ? null : { gte: lng - dLng, lte: lng + dLng };

    return { latitude, longitude };
}
