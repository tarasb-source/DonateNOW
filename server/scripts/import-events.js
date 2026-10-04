// Usage: npm run events:import -w server -- [--dry-run] [--max-searches=N] [--city="Chicago, IL"]
import { parseArgs } from "node:util";
import { prisma } from "../src/db.js";
import { importEvents } from "../src/eventImport/importEvents.js";

const { values } = parseArgs({
    options: {
        "dry-run": { type: "boolean", default: false },
        "max-searches": { type: "string" },
        city: { type: "string", multiple: true },
    },
});

const apiKey = process.env.SERPAPI_KEY;
if (!apiKey) {
    console.error("SERPAPI_KEY is not set (see server/.env.example).");
    process.exit(1);
}

const maxSearches = values["max-searches"] ? Number(values["max-searches"]) : undefined;
if (maxSearches !== undefined && !(maxSearches > 0)) {
    console.error("--max-searches must be a positive number.");
    process.exit(1);
}

try {
    const stats = await importEvents({ apiKey, maxSearches, onlyCities: values.city, dryRun: values["dry-run"] });
    console.log("\nSummary:", stats);
    if (values["dry-run"]) console.log("Dry run: nothing was saved.");
    else if (stats.saved > 0) console.log(`Review the new events with: npm run events:review -w server`);
} finally {
    await prisma.$disconnect();
}
