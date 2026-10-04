import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db.js";

const router = Router();

const querySchema = z.object({
    q: z.string().trim().max(100).optional(),
    category: z.string().trim().max(50).optional(),
});

const contains = (value) => ({ contains: value, mode: "insensitive" });

router.get("/", async (req, res) => {
    const { q, category } = querySchema.parse(req.query);
    const filters = [];

    // Categories are loose labels, so they also match location ("Remote") and tags.
    if (category && category !== "All") {
        filters.push({
            OR: ["category", "location", "tags"].map((field) => ({ [field]: contains(category) })),
        });
    }

    if (q) {
        filters.push({
            OR: ["title", "organization", "category", "tags", "location"].map((field) => ({ [field]: contains(q) })),
        });
    }

    const opportunities = await prisma.opportunity.findMany({
        where: { AND: filters },
        orderBy: { id: "asc" },
    });

    res.json(opportunities);
});

export default router;
