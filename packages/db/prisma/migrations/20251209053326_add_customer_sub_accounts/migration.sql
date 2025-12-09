/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `sub_accounts` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId]` on the table `sub_accounts` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[customerId,email]` on the table `sub_accounts` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `email` to the `sub_accounts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `sub_accounts` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "UserRole" ADD VALUE 'CUSTOMER_SUB_USER';

-- DropIndex
DROP INDEX "public"."sub_accounts_customerId_name_key";

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "createdBySubAccountId" TEXT;

-- AlterTable
ALTER TABLE "sub_accounts" ADD COLUMN     "canCreateOrders" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "canEditOrders" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "canViewReports" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "createdBy" TEXT,
ADD COLUMN     "email" TEXT NOT NULL,
ADD COLUMN     "updatedBy" TEXT,
ADD COLUMN     "userId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "sub_accounts_email_key" ON "sub_accounts"("email");

-- CreateIndex
CREATE UNIQUE INDEX "sub_accounts_userId_key" ON "sub_accounts"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "sub_accounts_customerId_email_key" ON "sub_accounts"("customerId", "email");

-- AddForeignKey
ALTER TABLE "sub_accounts" ADD CONSTRAINT "sub_accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_createdBySubAccountId_fkey" FOREIGN KEY ("createdBySubAccountId") REFERENCES "sub_accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;
