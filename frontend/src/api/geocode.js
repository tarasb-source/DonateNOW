import { apiFetch } from "./client.js";

export function geocode(query, signal) {
    return apiFetch(`/geocode?${new URLSearchParams({ q: query })}`, { signal });
}
