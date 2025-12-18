-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "usesTemplate" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "customer_description_templates" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "templateLines" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,

    CONSTRAINT "customer_description_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_description_data" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "descriptionData" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "order_description_data_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "customer_description_templates_customerId_key" ON "customer_description_templates"("customerId");

-- CreateIndex
CREATE UNIQUE INDEX "order_description_data_orderId_key" ON "order_description_data"("orderId");

-- AddForeignKey
ALTER TABLE "customer_description_templates" ADD CONSTRAINT "customer_description_templates_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_description_data" ADD CONSTRAINT "order_description_data_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
