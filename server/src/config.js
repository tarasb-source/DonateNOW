function required(name) {
    const value = process.env[name];
    if (!value) {
        throw new Error(`Missing required environment variable ${name} (see server/.env.example)`);
    }
    return value;
}

export const config = {
    port: Number(process.env.PORT) || 3000,
    databaseUrl: required("DATABASE_URL"),
    // Comma-separated list of origins allowed to call the API.
    clientOrigins: (process.env.CLIENT_ORIGINS ?? "http://localhost:5173").split(",").map((o) => o.trim()),
    gnewsApiKey: process.env.GNEWS_API_KEY ?? "",
    // Where donors return after donating, e.g. https://tarasb-source.github.io/DonateNOW
    publicSiteUrl: (process.env.PUBLIC_SITE_URL ?? "http://localhost:5173/DonateNOW").replace(/\/$/, ""),
    everyOrg: {
        // https://staging.every.org for test donations (card 4242 4242 4242 4242).
        baseUrl: (process.env.EVERYORG_BASE_URL ?? "https://www.every.org").replace(/\/$/, ""),
        // From Every.org's developer dashboard; tells Every.org to notify our webhook.
        webhookToken: process.env.EVERYORG_WEBHOOK_TOKEN ?? "",
        // Random secret in our webhook URL, since Every.org doesn't sign webhook requests.
        webhookSecret: process.env.DONATION_WEBHOOK_SECRET ?? "",
    },
};
