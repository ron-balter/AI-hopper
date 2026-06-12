-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "ProductRequestStatus" AS ENUM ('DRAFT', 'SEARCHING', 'READY_FOR_REVIEW', 'SELECTED', 'FAILED');

-- CreateEnum
CREATE TYPE "ComparisonStatus" AS ENUM ('NONE', 'COMPARING', 'READY', 'FAILED');

-- CreateEnum
CREATE TYPE "Marketplace" AS ENUM ('AMAZON', 'ALIEXPRESS');

-- CreateTable
CREATE TABLE "ProductRequest" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "rationale" TEXT NOT NULL,
    "status" "ProductRequestStatus" NOT NULL DEFAULT 'DRAFT',
    "agentId" TEXT,
    "lastRunId" TEXT,
    "lastRequestId" TEXT,
    "durationMs" INTEGER,
    "transcriptJson" TEXT,
    "selectedCandidateId" TEXT,
    "comparisonStatus" "ComparisonStatus" NOT NULL DEFAULT 'NONE',
    "comparisonTableJson" TEXT,
    "comparisonSummary" TEXT,
    "comparisonAgentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductCandidate" (
    "id" TEXT NOT NULL,
    "productRequestId" TEXT NOT NULL,
    "source" "Marketplace" NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "price" TEXT,
    "currency" TEXT,
    "rating" DOUBLE PRECISION,
    "reviewCount" INTEGER,
    "reviewSummary" TEXT NOT NULL,
    "pros" TEXT,
    "cons" TEXT,
    "imageUrl" TEXT,
    "rank" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductCandidate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "productRequestId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgentEvent" (
    "id" TEXT NOT NULL,
    "productRequestId" TEXT NOT NULL,
    "runId" TEXT,
    "eventType" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "payload" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AgentEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProductRequest_status_idx" ON "ProductRequest"("status");

-- CreateIndex
CREATE INDEX "ProductCandidate_productRequestId_idx" ON "ProductCandidate"("productRequestId");

-- CreateIndex
CREATE UNIQUE INDEX "ProductCandidate_productRequestId_url_key" ON "ProductCandidate"("productRequestId", "url");

-- CreateIndex
CREATE INDEX "Notification_read_idx" ON "Notification"("read");

-- CreateIndex
CREATE INDEX "AgentEvent_productRequestId_idx" ON "AgentEvent"("productRequestId");

-- AddForeignKey
ALTER TABLE "ProductCandidate" ADD CONSTRAINT "ProductCandidate_productRequestId_fkey" FOREIGN KEY ("productRequestId") REFERENCES "ProductRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_productRequestId_fkey" FOREIGN KEY ("productRequestId") REFERENCES "ProductRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentEvent" ADD CONSTRAINT "AgentEvent_productRequestId_fkey" FOREIGN KEY ("productRequestId") REFERENCES "ProductRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
