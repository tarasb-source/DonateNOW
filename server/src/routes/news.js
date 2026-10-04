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
    url.search = new URLSearchParams({ q: "Ukraine", lang: "en", country: "us", max: "10", apikey: config.gnewsApiKey });

    const response = await fetch(url);
    if (!response.ok) {
        // Serve stale news rather than nothing if GNews is down or rate limited.
        if (cache.articles) return res.json(cache.articles);
        return res.status(502).json({ error: "Could not load news." });
    }

    const data = await response.json();
    // Syndicated stories show up once per newspaper (with varying capitalization), so drop repeated titles.
    const seenTitles = new Set();
    const isNewTitle = (title) => {
        const key = title.toLowerCase().replace(/[^a-z0-9]/g, "");
        return !seenTitles.has(key) && seenTitles.add(key);
    };
    const articles = (data.articles ?? [])
        .filter(({ title }) => isNewTitle(title))
        .slice(0, 5)
        .map(({ title, description, url, image, publishedAt, source }) => ({
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
