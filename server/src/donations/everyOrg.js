import { config } from "../config.js";

// Every.org donate link: options go in the query string, before #donate.
// https://docs.every.org/docs/donate-link
export function donateUrl({ nonprofitSlug, intentId, amountCents, frequency }) {
    const params = new URLSearchParams({
        frequency: frequency === "MONTHLY" ? "MONTHLY" : "ONCE",
        partner_donation_id: intentId,
        success_url: `${config.publicSiteUrl}/donate/thank-you`,
        exit_url: `${config.publicSiteUrl}/donate`,
        theme_color: "065ab5",
    });
    if (amountCents) params.set("amount", (amountCents / 100).toFixed(2).replace(/\.00$/, ""));
    if (config.everyOrg.webhookToken) params.set("webhook_token", config.everyOrg.webhookToken);

    return `${config.everyOrg.baseUrl}/${encodeURIComponent(nonprofitSlug)}?${params}#donate`;
}

// "25", "25.5", "1,000.00" -> cents. Every.org sends amounts as strings.
export function toCents(amount) {
    const value = Number(String(amount).replace(/,/g, ""));
    return Number.isFinite(value) ? Math.round(value * 100) : null;
}
