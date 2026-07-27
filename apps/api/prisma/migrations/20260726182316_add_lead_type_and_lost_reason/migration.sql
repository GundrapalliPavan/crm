-- CreateEnum
CREATE TYPE "lead_type" AS ENUM ('dealer', 'distributor', 'retailer', 'builder', 'contractor', 'architect', 'electrician', 'corporate_customer', 'project', 'other');

-- CreateEnum
CREATE TYPE "lead_lost_reason" AS ENUM ('price', 'competitor', 'no_requirement', 'no_response', 'budget', 'product_availability', 'delivery_timeline', 'credit_terms', 'location', 'duplicate', 'invalid_lead', 'other');

-- AlterTable
ALTER TABLE "leads" ADD COLUMN     "lead_type" "lead_type",
ADD COLUMN     "lost_at" TIMESTAMPTZ(6),
ADD COLUMN     "lost_notes" TEXT,
ADD COLUMN     "lost_reason" "lead_lost_reason";

-- CreateIndex
CREATE INDEX "leads_lead_type_idx" ON "leads"("lead_type");
