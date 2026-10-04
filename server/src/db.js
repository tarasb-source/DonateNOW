import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/prisma/index.js";
import { config } from "./config.js";

// On serverless hosts every instance has its own pool, so keep it small there
// (Supabase's free plan limits connections per pooler).
const adapter = new PrismaPg({ connectionString: config.databaseUrl, max: config.databasePoolMax });

export const prisma = new PrismaClient({ adapter });
