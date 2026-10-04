import { Router } from "express";
import { config } from "../config.js";

const router = Router();

// GNews' free plan allows 100 requests/day, so cache results in memory.
const CACHE_MS = 30 * 60 * 1000;
let cache = { articles: null, fetchedAt: 0 };

router.get("/", async (req, res) => {
    if (!config.gnewsApiKey) {
        return res.status(503).json({ error: "News is not configured." });
    }

    if (cache.articles && Date.now() - cache.fetchedAt < CACHE_MS) {
        return res.json(cache.articles);
    }

    const url = new URL("https://gnews.io/api/v4/search");
    url.search = new URLSearchParams({ q: "Ukraine", lang: "en", country: "us", max: "5", apikey: config.gnewsApiKey });

    const response = await fetch(url);
    if (!response.ok) {
        // Serve stale news rather than nothing if GNews is down or rate limited.
        if (cache.articles) return res.json(cache.articles);
        return res.status(502).json({ error: "Could not load news." });
    }

    const data = await response.json();
    const articles = (data.articles ?? []).map(({ title, description, url, image, publishedAt, source }) => ({
        title,
        description,
        url,
        image,
        publishedAt,
        source: source?.name,
    }));

    cache = { articles, fetchedAt: Date.now() };
    res.json(articles);
});

export default router;
