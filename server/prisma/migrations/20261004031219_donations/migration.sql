-- CreateEnum
CREATE TYPE "DonationFrequency" AS ENUM ('ONCE', 'MONTHLY');

-- CreateTable
CREATE TABLE "DonationIntent" (
    "id" TEXT NOT NULL,
    "nonprofitSlug" TEXT NOT NULL,
    "amountCents" INTEGER,
    "frequency" "DonationFrequency" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DonationIntent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Donation" (
    "id" SERIAL NOT NULL,
    "chargeId" TEXT NOT NULL,
    "intentId" TEXT NOT NULL,
    "nonprofitSlug" TEXT NOT NULL,
    "nonprofitName" TEXT NOT NULL,
    "amountCents" INTEGER NOT NULL,
    "netAmountCents" INTEGER,
    "currency" TEXT NOT NULL,
    "frequency" "DonationFrequency" NOT NULL,
    "donatedAt" TIMESTAMPTZ(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Donation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Donation_chargeId_key" ON "Donation"("chargeId");

-- CreateIndex
CREATE INDEX "Donation_intentId_idx" ON "Donation"("intentId");

-- AddForeignKey
ALTER TABLE "Donation" ADD CONSTRAINT "Donation_intentId_fkey" FOREIGN KEY ("intentId") REFERENCES "DonationIntent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;


-- Keep donation records out of Supabase's public Data API, like the other tables.
ALTER TABLE "DonationIntent" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Donation" ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
        REVOKE ALL ON TABLE "DonationIntent", "Donation" FROM anon, authenticated;
    END IF;
END $$;
