import { apiFetch } from "./client.js";

export function getOpportunities({ q, category }, signal) {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (category && category !== "All") params.set("category", category);

    return apiFetch(`/opportunities?${params}`, { signal });
}
