import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "node --env-file-if-exists=.env prisma/seed.js",
  },
  datasource: {
    // Read directly (not via env()) so `prisma generate` works without a database configured.
    url: process.env.DATABASE_URL,
  },
});
