-- AlterTable
ALTER TABLE "container_employees" ADD COLUMN     "completedAt" TIMESTAMP(3),
ADD COLUMN     "isCompleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "reportedArticleQuantity" INTEGER DEFAULT 0,
ADD COLUMN     "reportedCartonQuantity" INTEGER DEFAULT 0;
