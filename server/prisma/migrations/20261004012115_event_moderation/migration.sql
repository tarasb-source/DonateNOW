-- CreateEnum
CREATE TYPE "EventStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- DropIndex
DROP INDEX "Event_startsAt_idx";

-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "source" TEXT NOT NULL DEFAULT 'manual',
ADD COLUMN     "sourceId" TEXT,
ADD COLUMN     "status" "EventStatus" NOT NULL DEFAULT 'APPROVED';

-- CreateIndex
CREATE INDEX "Event_status_startsAt_idx" ON "Event"("status", "startsAt");

-- CreateIndex
CREATE UNIQUE INDEX "Event_source_sourceId_key" ON "Event"("source", "sourceId");

