-- Add articleQuantity to containers
-- articleQuantity tracks distinct article types; pieceQuantity tracks individual units

ALTER TABLE "containers" ADD COLUMN "articleQuantity" INTEGER NOT NULL DEFAULT 0;
UPDATE "containers" SET "articleQuantity" = "pieceQuantity";
