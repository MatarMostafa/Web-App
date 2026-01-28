-- AlterEnum
ALTER TYPE "ActivityType" ADD VALUE 'CONTAINER_LOADING';

-- AlterTable
ALTER TABLE "customer_activities" ADD COLUMN     "basePrice" DECIMAL(10,2) DEFAULT 0;

-- CreateTable
CREATE TABLE "containers" (
    "id" TEXT NOT NULL,
    "serialNumber" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "cartonQuantity" INTEGER NOT NULL,
    "articleQuantity" INTEGER NOT NULL,
    "cartonPrice" DECIMAL(10,2) NOT NULL,
    "articlePrice" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "containers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "container_articles" (
    "id" TEXT NOT NULL,
    "containerId" TEXT NOT NULL,
    "articleName" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "container_articles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "container_employees" (
    "id" TEXT NOT NULL,
    "containerId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "role" TEXT,

    CONSTRAINT "container_employees_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "containers_serialNumber_key" ON "containers"("serialNumber");

-- CreateIndex
CREATE UNIQUE INDEX "container_employees_containerId_employeeId_key" ON "container_employees"("containerId", "employeeId");

-- AddForeignKey
ALTER TABLE "containers" ADD CONSTRAINT "containers_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "container_articles" ADD CONSTRAINT "container_articles_containerId_fkey" FOREIGN KEY ("containerId") REFERENCES "containers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "container_employees" ADD CONSTRAINT "container_employees_containerId_fkey" FOREIGN KEY ("containerId") REFERENCES "containers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "container_employees" ADD CONSTRAINT "container_employees_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;
