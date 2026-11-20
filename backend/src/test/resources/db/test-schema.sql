-- Mirrors the production tables used by the repository tests (from the original Prisma migrations).
-- Runs inside each test's transaction, which is rolled back afterwards, so there is nothing to drop.

CREATE TYPE "EventStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
CREATE TYPE "DonationFrequency" AS ENUM ('ONCE', 'MONTHLY');

CREATE TABLE "Event" (
    "id" SERIAL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "organization" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "category" TEXT NOT NULL DEFAULT '',
    "link" TEXT NOT NULL DEFAULT '',
    "startsAt" TIMESTAMPTZ(3) NOT NULL,
    "endsAt" TIMESTAMPTZ(3),
    "address" TEXT NOT NULL DEFAULT '',
    "city" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "source" TEXT NOT NULL DEFAULT 'manual',
    "sourceId" TEXT,
    "status" "EventStatus" NOT NULL DEFAULT 'APPROVED'
);

CREATE TABLE "DonationIntent" (
    "id" TEXT PRIMARY KEY,
    "nonprofitSlug" TEXT NOT NULL,
    "amountCents" INTEGER,
    "frequency" "DonationFrequency" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "Donation" (
    "id" SERIAL PRIMARY KEY,
    "chargeId" TEXT NOT NULL UNIQUE,
    "intentId" TEXT NOT NULL REFERENCES "DonationIntent"("id"),
    "nonprofitSlug" TEXT NOT NULL,
    "nonprofitName" TEXT NOT NULL,
    "amountCents" INTEGER NOT NULL,
    "netAmountCents" INTEGER,
    "currency" TEXT NOT NULL,
    "frequency" "DonationFrequency" NOT NULL,
    "donatedAt" TIMESTAMPTZ(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
