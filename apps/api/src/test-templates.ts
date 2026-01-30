import { prisma } from "@repo/db";

async function testTemplateImplementation() {
  console.log("🧪 Testing Template Implementation...\n");

  try {
    // 1. Create a test customer (if not exists)
    let customer = await prisma.customer.findFirst({
      where: { companyName: "Test Logistics Co" }
    });

    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          companyName: "Test Logistics Co",
          contactEmail: "test@logistics.com",
          industry: "Logistics"
        }
      });
    } else {
      console.log("✅ Using existing test customer:", customer.companyName);
    }

    // 2. Create a customer template
    const template = await prisma.customerDescriptionTemplate.create({
      data: {
        customerId: customer.id,
        templateLines: ["Container Type", "Goods Description", "Weight (kg)", "Special Instructions"],
        createdBy: "test-admin"
      }
    });

    // 3. Create a test order
    const order = await prisma.order.create({
      data: {
        orderNumber: `TEST-${Date.now()}`,
        title: "Test Container Order",
        scheduledDate: new Date(),
        customerId: customer.id,
        usesTemplate: true
      }
    });

    // 4. Create order description data
    const orderData = await prisma.orderDescriptionData.create({
      data: {
        orderId: order.id,
        descriptionData: {
          "Container Type": "20ft Standard Container",
          "Goods Description": "Electronics Equipment",
          "Weight (kg)": "15000",
          "Special Instructions": "Handle with care - fragile items"
        }
      }
    });
    console.log("✅ Created order description data:", orderData.descriptionData);

    // 5. Test retrieval with relations
    const orderWithTemplate = await prisma.order.findUnique({
      where: { id: order.id },
      include: {
        customer: {
          include: {
            descriptionTemplate: true
          }
        },
        descriptionData: true
      }
    });

    console.log("\n📋 Complete Order with Template Data:");
    console.log("Order Number:", orderWithTemplate?.orderNumber);
    console.log("Uses Template:", orderWithTemplate?.usesTemplate);
    console.log("Template Lines:", orderWithTemplate?.customer.descriptionTemplate?.templateLines);
    console.log("Filled Data:", orderWithTemplate?.descriptionData?.descriptionData);

    // 6. Clean up test data
    await prisma.orderDescriptionData.delete({ where: { orderId: order.id } });
    await prisma.order.delete({ where: { id: order.id } });
    await prisma.customerDescriptionTemplate.delete({ where: { customerId: customer.id } });
    await prisma.customer.delete({ where: { id: customer.id } });

    console.log("\n🧹 Cleaned up test data");
    console.log("\n🎉 Template implementation test completed successfully!");

  } catch (error) {
    console.error("❌ Test failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testTemplateImplementation();