/*
  Warnings:

  - A unique constraint covering the columns `[teamLeaderId]` on the table `teams` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "teams_teamLeaderId_key" ON "teams"("teamLeaderId");
