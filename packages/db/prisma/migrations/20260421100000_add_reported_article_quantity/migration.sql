-- Add reportedArticleQuantity column to container_employees for three-way reporting
ALTER TABLE "container_employees"
ADD COLUMN IF NOT EXISTS "reportedArticleQuantity" INTEGER DEFAULT 0;
