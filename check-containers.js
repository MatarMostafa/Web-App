const { PrismaClient } = require('./packages/db/src/generated/prisma');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://neondb_owner:npg_ygLxAXai1n6b@ep-green-wildflower-abnyl1wo-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require"
    }
  }
});

async function checkContainers() {
  try {
    // Get recent orders with containers
    const orders = await prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        containers: {
          include: {
            articles: true,
            employeeAssignments: true
          }
        }
      }
    });

    console.log('Recent orders with containers:');
    orders.forEach(order => {
      console.log(`\nOrder ${order.orderNumber} (${order.id}):`);
      console.log(`  Created: ${order.createdAt}`);
      console.log(`  Containers: ${order.containers.length}`);
      
      order.containers.forEach((container, index) => {
        console.log(`    Container ${index + 1}:`);
        console.log(`      Serial: ${container.serialNumber}`);
        console.log(`      Cartons: ${container.cartonQuantity}`);
        console.log(`      Articles: ${container.articleQuantity}`);
        console.log(`      Articles in container: ${container.articles.length}`);
      });
    });

    // Get total container count
    const totalContainers = await prisma.container.count();
    console.log(`\nTotal containers in database: ${totalContainers}`);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkContainers();