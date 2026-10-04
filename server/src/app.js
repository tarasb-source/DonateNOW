import express from "express";
import cors from "cors";
import { ZodError } from "zod";
import { config } from "./config.js";
import opportunitiesRouter from "./routes/opportunities.js";
import contactRouter from "./routes/contact.js";
import newsRouter from "./routes/news.js";
import eventsRouter from "./routes/events.js";
import geocodeRouter from "./routes/geocode.js";
import donationsRouter from "./routes/donations.js";

const app = express();

// Hosting platforms (Render, Railway) sit behind one proxy; needed for per-IP rate limits.
app.set("trust proxy", 1);
app.use(cors({ origin: config.clientOrigins }));
app.use(express.json({ limit: "10kb" }));

app.get("/api/health", (req, res) => res.json({ ok: true }));
app.use("/api/opportunities", opportunitiesRouter);
app.use("/api/contact", contactRouter);
app.use("/api/news", newsRouter);
app.use("/api/events", eventsRouter);
app.use("/api/geocode", geocodeRouter);
app.use("/api/donations", donationsRouter);

app.use((req, res) => {
    res.status(404).json({ error: "Not found" });
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
    if (err instanceof ZodError) {
        return res.status(400).json({ error: "Invalid request", issues: err.issues });
    }
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
});

export default app;
