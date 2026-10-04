import { prisma } from "../src/db.js";
import { opportunities } from "./seed-data.js";

// Only seeds an empty table, so it's safe to run more than once.
const count = await prisma.opportunity.count();

if (count === 0) {
    const { count: created } = await prisma.opportunity.createMany({ data: opportunities });
    console.log(`Seeded ${created} opportunities.`);
} else {
    console.log(`Opportunity table already has ${count} rows, skipping seed.`);
}

await prisma.$disconnect();
