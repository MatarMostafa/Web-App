-- CreateEnum
CREATE TYPE "NoteCategory" AS ENUM ('COMPLETION_REQUEST', 'ADMIN_RESPONSE', 'GENERAL_UPDATE', 'ISSUE_REPORT');

-- AlterEnum
ALTER TYPE "OrderStatus" ADD VALUE 'IN_REVIEW';

-- CreateTable
CREATE TABLE "order_notes" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "triggersStatus" "OrderStatus",
    "category" "NoteCategory" NOT NULL DEFAULT 'GENERAL_UPDATE',
    "isInternal" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "order_notes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "order_notes_orderId_createdAt_idx" ON "order_notes"("orderId", "createdAt");

-- AddForeignKey
ALTER TABLE "order_notes" ADD CONSTRAINT "order_notes_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_notes" ADD CONSTRAINT "order_notes_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
