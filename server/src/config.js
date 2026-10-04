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
};
