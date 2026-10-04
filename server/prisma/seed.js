import { prisma } from "../src/db.js";
import { opportunities } from "./seed-data.js";
import { events } from "./seed-events.js";

// Only seeds empty tables, so it's safe to run more than once.
async function seed(name, model, rows) {
    const count = await model.count();
    if (count > 0) {
        console.log(`${name}: table already has ${count} rows, skipping.`);
        return;
    }
    if (rows.length === 0) {
        console.log(`${name}: no seed data.`);
        return;
    }
    const { count: created } = await model.createMany({ data: rows });
    console.log(`${name}: seeded ${created} rows.`);
}

await seed("Opportunity", prisma.opportunity, opportunities);
await seed("Event", prisma.event, events);

await prisma.$disconnect();
