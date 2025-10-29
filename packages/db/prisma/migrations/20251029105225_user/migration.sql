-- AlterTable
ALTER TABLE "employees" ALTER COLUMN "firstName" DROP NOT NULL,
ALTER COLUMN "lastName" DROP NOT NULL;

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "email" DROP NOT NULL;
