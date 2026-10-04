import { Router } from "express";
import rateLimit from "express-rate-limit";
import { z } from "zod";

const router = Router();

// Nominatim's usage policy: identify the app, at most 1 request/second, cache results.
// https://operations.osmfoundation.org/policies/nominatim/
const USER_AGENT = "DonateNOW/1.0 (+https://github.com/tarasb-source/DonateNOW)";
const MIN_INTERVAL_MS = 1100;
const MAX_CACHE_ENTRIES = 500;

const cache = new Map();
let queue = Promise.resolve();

// Chain upstream calls so they never run closer together than MIN_INTERVAL_MS.
function throttled(fn) {
    const result = queue.then(fn);
    queue = result.catch(() => {}).then(() => new Promise((resolve) => setTimeout(resolve, MIN_INTERVAL_MS)));
    return result;
}

async function lookup(q) {
    const url = new URL("https://nominatim.openstreetmap.org/search");
    // English names, so "Lviv" comes back as "Lviv" rather than "Львів".
    url.search = new URLSearchParams({ q, format: "jsonv2", limit: "1", "accept-language": "en" });

    const response = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
    if (!response.ok) throw new Error(`Nominatim responded ${response.status}`);

    const [place] = await response.json();
    return place
        ? { name: place.display_name, latitude: Number(place.lat), longitude: Number(place.lon) }
        : null;
}

const querySchema = z.object({ q: z.string().trim().min(2).max(200) });

const limiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 20,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: { error: "Too many searches. Please wait a minute and try again." },
});

router.get("/", limiter, async (req, res) => {
    const { q } = querySchema.parse(req.query);
    const key = q.toLowerCase();

    if (!cache.has(key)) {
        const place = await throttled(() => lookup(q));
        if (cache.size >= MAX_CACHE_ENTRIES) cache.delete(cache.keys().next().value);
        cache.set(key, place);
    }

    const place = cache.get(key);
    if (!place) return res.status(404).json({ error: "We couldn't find that place." });
    res.json(place);
});

export default router;
