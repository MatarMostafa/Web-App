/*
  Warnings:

  - You are about to drop the column `email` on the `sub_accounts` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[customerId,name]` on the table `sub_accounts` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "public"."sub_accounts_customerId_email_key";

-- DropIndex
DROP INDEX "public"."sub_accounts_email_key";

-- AlterTable
ALTER TABLE "sub_accounts" DROP COLUMN "email";

-- CreateIndex
CREATE UNIQUE INDEX "sub_accounts_customerId_name_key" ON "sub_accounts"("customerId", "name");
