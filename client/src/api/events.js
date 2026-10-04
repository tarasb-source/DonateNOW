import { apiFetch } from "./client.js";

export function getEvents({ origin, radius }, signal) {
    const params = new URLSearchParams();
    if (origin) {
        params.set("lat", origin.latitude);
        params.set("lng", origin.longitude);
        params.set("radius", radius);
    }
    return apiFetch(`/events?${params}`, { signal });
}
