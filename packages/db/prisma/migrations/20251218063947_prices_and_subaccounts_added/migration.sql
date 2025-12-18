/*
  Warnings:

  - You are about to drop the column `canCreateOrders` on the `sub_accounts` table. All the data in the column will be lost.
  - You are about to drop the column `canEditOrders` on the `sub_accounts` table. All the data in the column will be lost.
  - You are about to drop the column `canViewReports` on the `sub_accounts` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "sub_accounts" DROP COLUMN "canCreateOrders",
DROP COLUMN "canEditOrders",
DROP COLUMN "canViewReports";
