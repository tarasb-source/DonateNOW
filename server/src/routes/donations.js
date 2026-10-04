import { Router } from "express";
import rateLimit from "express-rate-limit";
import { timingSafeEqual } from "node:crypto";
import { z } from "zod";
import { config } from "../config.js";
import { prisma } from "../db.js";
import { isDonatable } from "../donations/charities.js";
import { donateUrl, toCents } from "../donations/everyOrg.js";

const router = Router();

// --- Start a donation: record the intent and send the donor to Every.org ---

const intentSchema = z.object({
    nonprofitSlug: z.string().trim().refine(isDonatable, "Unknown charity"),
    amount: z.number().min(1).max(100000).optional(),
    frequency: z.enum(["ONCE", "MONTHLY"]).default("ONCE"),
});

const intentLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    limit: 20,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: { error: "Too many attempts. Please try again in a few minutes." },
});

router.post("/", intentLimiter, async (req, res) => {
    const { nonprofitSlug, amount, frequency } = intentSchema.parse(req.body);
    const amountCents = amount ? Math.round(amount * 100) : null;

    const intent = await prisma.donationIntent.create({ data: { nonprofitSlug, amountCents, frequency } });
    res.status(201).json({ url: donateUrl({ nonprofitSlug, intentId: intent.id, amountCents, frequency }) });
});

// --- Totals for the "money raised" counter ---

const STATS_CACHE_MS = 60 * 1000;
let statsCache = { value: null, fetchedAt: 0 };

router.get("/stats", async (req, res) => {
    if (!statsCache.value || Date.now() - statsCache.fetchedAt > STATS_CACHE_MS) {
        const { _sum, _count } = await prisma.donation.aggregate({
            where: { currency: "USD" },
            _sum: { amountCents: true },
            _count: true,
        });
        statsCache = {
            value: { totalRaised: (_sum.amountCents ?? 0) / 100, donationCount: _count },
            fetchedAt: Date.now(),
        };
    }
    res.json(statsCache.value);
});

// --- Every.org partner webhook: a donation was completed ---
// Every.org doesn't sign webhooks, so we (1) hide the endpoint behind a secret URL segment and
// (2) only accept donations that reference an intent created on our site.

const webhookSchema = z.object({
    chargeId: z.string().min(1).max(200),
    partnerDonationId: z.string().uuid().nullish(),
    toNonprofit: z.object({ slug: z.string(), name: z.string().optional() }).passthrough(),
    amount: z.union([z.string(), z.number()]),
    netAmount: z.union([z.string(), z.number()]).nullish(),
    currency: z.string().length(3),
    frequency: z.string(),
    donationDate: z.string(),
}).passthrough();

function secretMatches(given) {
    const expected = Buffer.from(config.everyOrg.webhookSecret);
    const actual = Buffer.from(given ?? "");
    return expected.length > 0 && actual.length === expected.length && timingSafeEqual(actual, expected);
}

router.post("/webhook/:secret", async (req, res) => {
    if (!secretMatches(req.params.secret)) return res.status(404).json({ error: "Not found" });

    const parsed = webhookSchema.safeParse(req.body);
    if (!parsed.success) {
        console.warn("Every.org webhook: unexpected payload", parsed.error.issues);
        return res.status(400).json({ error: "Invalid payload" });
    }
    const donation = parsed.data;

    // Donations made on Every.org without going through our site have no matching intent.
    const intent = donation.partnerDonationId
        ? await prisma.donationIntent.findUnique({ where: { id: donation.partnerDonationId } })
        : null;
    if (!intent) {
        console.warn(`Every.org webhook: no intent for charge ${donation.chargeId}, ignoring`);
        return res.status(200).json({ ok: true, ignored: true });
    }

    const amountCents = toCents(donation.amount);
    const donatedAt = new Date(donation.donationDate);
    if (amountCents === null || amountCents <= 0 || Number.isNaN(donatedAt.getTime())) {
        return res.status(400).json({ error: "Invalid amount or date" });
    }

    // Every.org may retry; the unique chargeId makes this idempotent.
    await prisma.donation.upsert({
        where: { chargeId: donation.chargeId },
        update: {},
        create: {
            chargeId: donation.chargeId,
            intentId: intent.id,
            nonprofitSlug: donation.toNonprofit.slug,
            nonprofitName: donation.toNonprofit.name ?? donation.toNonprofit.slug,
            amountCents,
            netAmountCents: donation.netAmount != null ? toCents(donation.netAmount) : null,
            currency: donation.currency.toUpperCase(),
            frequency: /month/i.test(donation.frequency) ? "MONTHLY" : "ONCE",
            donatedAt,
        },
    });
    statsCache.fetchedAt = 0;

    res.status(200).json({ ok: true });
});

export default router;
