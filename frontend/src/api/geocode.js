import { apiFetch } from "./client.js";

// Returns { name, latitude, longitude } for a place name like "Chicago" or "Lviv, Ukraine".
export function geocode(query, signal) {
    return apiFetch(`/geocode?${new URLSearchParams({ q: query })}`, { signal });
}
