-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "actualHours" DECIMAL(5,2),
ADD COLUMN     "archivedAt" TIMESTAMP(3),
ADD COLUMN     "estimatedHours" DECIMAL(5,2),
ADD COLUMN     "isArchived" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "title" TEXT;

-- CreateIndex
CREATE INDEX "orders_isArchived_scheduledDate_idx" ON "orders"("isArchived", "scheduledDate");
