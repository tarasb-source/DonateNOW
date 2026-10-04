// Usage: npm run events:review -w server
// Walks through PENDING events and approves or rejects each one.
import readline from "node:readline/promises";
import tzlookup from "@photostructure/tz-lookup";
import { prisma } from "../src/db.js";

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
// Read answers line by line (rather than rl.question) so piped input works as well as a terminal:
// the iterator buffers lines that arrive before we ask.
const lines = rl[Symbol.asyncIterator]();

async function ask(prompt) {
    process.stdout.write(prompt);
    const { value, done } = await lines.next();
    return done ? "q" : value.trim();
}

function formatInVenueTime(date, event) {
    const timeZone = tzlookup(event.latitude, event.longitude);
    return date.toLocaleString("en-US", { timeZone, dateStyle: "full", timeStyle: "short" }) + ` (${timeZone})`;
}

try {
    const pending = await prisma.event.findMany({
        where: { status: "PENDING", startsAt: { gte: new Date(Date.now() - 6 * 60 * 60 * 1000) } },
        orderBy: { startsAt: "asc" },
    });

    if (pending.length === 0) {
        console.log("No pending events to review.");
    }

    let approved = 0;
    let rejected = 0;

    for (const [i, event] of pending.entries()) {
        console.log(`\n[${i + 1}/${pending.length}] ${event.title}`);
        console.log(`  When:  ${formatInVenueTime(event.startsAt, event)}${event.endsAt ? ` → ${formatInVenueTime(event.endsAt, event)}` : ""}`);
        console.log(`  Where: ${event.address}, ${event.city}`);
        if (event.description) console.log(`  About: ${event.description}`);
        console.log(`  Check: ${event.link}`);

        const answer = (await ask("  [a]pprove, [r]eject, [s]kip, [q]uit? ")).toLowerCase();

        if (answer === "q") break;
        if (answer === "r") {
            await prisma.event.update({ where: { id: event.id }, data: { status: "REJECTED" } });
            rejected += 1;
        } else if (answer === "a") {
            const link = await ask("  Event page URL (Enter to keep the Google search link): ");
            const organization = await ask(`  Organizer (Enter to keep "${event.organization}"): `);
            const data = { status: "APPROVED" };
            if (link) {
                if (!/^https?:\/\//.test(link)) console.log("  (Ignored link: it must start with http:// or https://)");
                else data.link = link;
            }
            if (organization) data.organization = organization;
            await prisma.event.update({ where: { id: event.id }, data });
            approved += 1;
        }
    }

    console.log(`\nApproved ${approved}, rejected ${rejected}.`);
} finally {
    rl.close();
    await prisma.$disconnect();
}
