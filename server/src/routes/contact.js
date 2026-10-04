import { Router } from "express";
import rateLimit from "express-rate-limit";
import { z } from "zod";
import { prisma } from "../db.js";

const router = Router();

const contactSchema = z.object({
    name: z.string().trim().min(1).max(100),
    email: z.email().max(254),
    message: z.string().trim().min(1).max(750),
    newsletter: z.boolean().default(false),
});

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 5,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: { error: "Too many messages sent. Please try again later." },
});

router.post("/", limiter, async (req, res) => {
    const data = contactSchema.parse(req.body);
    await prisma.contactMessage.create({ data });
    res.status(201).json({ ok: true });
});

export default router;
