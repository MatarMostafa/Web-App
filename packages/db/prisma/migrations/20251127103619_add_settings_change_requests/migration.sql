-- CreateEnum
CREATE TYPE "SettingsChangeType" AS ENUM ('FIRST_NAME', 'LAST_NAME', 'EMAIL_ADDRESS', 'COMPANY_NAME', 'TAX_NUMBER');

-- CreateTable
CREATE TABLE "settings_change_requests" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "requestType" "SettingsChangeType" NOT NULL,
    "currentValue" TEXT,
    "requestedValue" TEXT NOT NULL,
    "reason" TEXT,
    "status" "RequestStatus" NOT NULL DEFAULT 'PENDING',
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "reviewNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "settings_change_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "settings_change_requests_userId_status_idx" ON "settings_change_requests"("userId", "status");

-- CreateIndex
CREATE INDEX "settings_change_requests_status_createdAt_idx" ON "settings_change_requests"("status", "createdAt");

-- AddForeignKey
ALTER TABLE "settings_change_requests" ADD CONSTRAINT "settings_change_requests_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
