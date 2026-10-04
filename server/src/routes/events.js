import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db.js";
import { boundingBox, distanceKm } from "../lib/geo.js";

const router = Router();

const querySchema = z
    .object({
        lat: z.coerce.number().min(-90).max(90).optional(),
        lng: z.coerce.number().min(-180).max(180).optional(),
        radius: z.coerce.number().min(1).max(20000).default(100),
    })
    .refine((q) => (q.lat === undefined) === (q.lng === undefined), {
        message: "lat and lng must be provided together",
    });

// Events without an end time stay listed for a few hours after they start.
const ONGOING_GRACE_MS = 6 * 60 * 60 * 1000;
const MAX_RESULTS = 200;

router.get("/", async (req, res) => {
    const { lat, lng, radius } = querySchema.parse(req.query);
    const now = new Date();

    const upcoming = {
        status: "APPROVED",
        OR: [
            { endsAt: { gte: now } },
            { endsAt: null, startsAt: { gte: new Date(now.getTime() - ONGOING_GRACE_MS) } },
        ],
    };

    if (lat === undefined) {
        const events = await prisma.event.findMany({
            where: upcoming,
            orderBy: { startsAt: "asc" },
            take: MAX_RESULTS,
        });
        return res.json(events);
    }

    // Narrow down with the indexed bounding box, then filter and sort by exact distance.
    const box = boundingBox(lat, lng, radius);
    const candidates = await prisma.event.findMany({
        where: {
            AND: [upcoming, { latitude: box.latitude }, box.longitude ? { longitude: box.longitude } : {}],
        },
    });

    const events = candidates
        .map((event) => ({
            ...event,
            distanceKm: Math.round(distanceKm(lat, lng, event.latitude, event.longitude) * 10) / 10,
        }))
        .filter((event) => event.distanceKm <= radius)
        .sort((a, b) => a.distanceKm - b.distanceKm || a.startsAt - b.startsAt)
        .slice(0, MAX_RESULTS);

    res.json(events);
});

export default router;
