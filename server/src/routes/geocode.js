import { Router } from "express";
import rateLimit from "express-rate-limit";
import { z } from "zod";
import { geocode } from "../lib/nominatim.js";

const router = Router();

const MAX_CACHE_ENTRIES = 500;
const cache = new Map();

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
        const place = await geocode(q);
        if (cache.size >= MAX_CACHE_ENTRIES) cache.delete(cache.keys().next().value);
        cache.set(key, place);
    }

    const place = cache.get(key);
    if (!place) return res.status(404).json({ error: "We couldn't find that place." });
    res.json(place);
});

export default router;
