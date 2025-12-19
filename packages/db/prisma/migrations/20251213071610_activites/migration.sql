-- CreateTable
CREATE TABLE "customer_activities" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "activityId" TEXT NOT NULL,
    "orderId" TEXT,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unitPrice" DECIMAL(10,2),
    "lineTotal" DECIMAL(12,2),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customer_activities_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "customer_activities_customerId_idx" ON "customer_activities"("customerId");

-- CreateIndex
CREATE INDEX "customer_activities_orderId_idx" ON "customer_activities"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX "customer_activities_customerId_activityId_orderId_key" ON "customer_activities"("customerId", "activityId", "orderId");

-- AddForeignKey
ALTER TABLE "customer_activities" ADD CONSTRAINT "customer_activities_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_activities" ADD CONSTRAINT "customer_activities_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "activities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_activities" ADD CONSTRAINT "customer_activities_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
