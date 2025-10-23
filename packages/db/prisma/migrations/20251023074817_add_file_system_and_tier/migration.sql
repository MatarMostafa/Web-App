-- CreateEnum
CREATE TYPE "AssignmentTier" AS ENUM ('PRIMARY', 'BACKUP', 'FALLBACK');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('RESUME', 'ID_CARD', 'PASSPORT', 'CONTRACT', 'CERTIFICATE', 'WORK_EVIDENCE', 'PROFILE_PICTURE', 'OTHER');

-- AlterTable
ALTER TABLE "assignments" ADD COLUMN     "tier" "AssignmentTier" NOT NULL DEFAULT 'PRIMARY';

-- CreateTable
CREATE TABLE "files" (
    "id" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "path" TEXT NOT NULL,
    "documentType" "DocumentType" NOT NULL DEFAULT 'OTHER',
    "description" TEXT,
    "expiryDate" TIMESTAMP(3),
    "employeeId" TEXT,
    "orderId" TEXT,
    "assignmentId" TEXT,
    "uploadedBy" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "files_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "files" ADD CONSTRAINT "files_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "files" ADD CONSTRAINT "files_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "files" ADD CONSTRAINT "files_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "assignments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
