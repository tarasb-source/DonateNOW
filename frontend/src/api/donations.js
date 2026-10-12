import { apiFetch } from "./client.js";

// Returns { url } of the Every.org donation page for this donation.
export function startDonation({ nonprofitSlug, amount, frequency }) {
    return apiFetch("/donations", { method: "POST", body: { nonprofitSlug, amount, frequency } });
}

export function getDonationStats(signal) {
    return apiFetch("/donations/stats", { signal });
}
