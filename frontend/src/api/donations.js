import { apiFetch } from "./client.js";

export function startDonation({ nonprofitSlug, amount, frequency }) {
    return apiFetch("/donations", { method: "POST", body: { nonprofitSlug, amount, frequency } });
}

export function getDonationStats(signal) {
    return apiFetch("/donations/stats", { signal });
}
