import { PrismaClient } from '@repo/db/src/generated/prisma';
import { Decimal } from 'decimal.js';

const prisma = new PrismaClient();

async function backfillPricing() {
  console.log('Starting pricing backfill...');

  try {
    // Step 1: Create default activities from existing qualifications
    console.log('\n1. Creating activities from qualifications...');
    const qualifications = await prisma.qualification.findMany({
      where: { isActive: true }
    });

    const activityMap = new Map<string, string>();
    let activitiesCreated = 0;

    for (const qual of qualifications) {
      try {
        const activity = await prisma.activity.create({
          data: {
            name: qual.name,
            code: qual.category || undefined,
            description: qual.description,
            type: 'OTHER', // Default activity type
            // No defaultPrice field in Activity model
            unit: 'hour',
            isActive: true
          }
        });
        activityMap.set(qual.id, activity.id);
        activitiesCreated++;
      } catch (error: any) {
        if (error.code === 'P2002') {
          // Activity already exists, find it
          const existing = await prisma.activity.findUnique({
            where: { name: qual.name }
          });
          if (existing) {
            activityMap.set(qual.id, existing.id);
          }
        } else {
          console.error(`Error creating activity for ${qual.name}:`, error.message);
        }
      }
    }
    console.log(`✓ Created ${activitiesCreated} activities`);

    // Step 2: Backfill existing OrderQualifications with price snapshots
    console.log('\n2. Backfilling order qualifications with price snapshots...');
    const orderQualifications = await prisma.orderQualification.findMany({
      where: {
        unitPrice: null // Only backfill records without prices
      },
      include: {
        order: {
          include: { customer: true }
        },
        qualification: true
      }
    });

    let backfilled = 0;
    let skipped = 0;

    for (const oq of orderQualifications) {
      const activityId = activityMap.get(oq.qualificationId);
      
      if (!activityId) {
        skipped++;
        continue;
      }

      try {
        // Try to find customer-specific price
        const customerPrice = await prisma.customerPrice.findFirst({
          where: {
            customerId: oq.order.customerId,
            activityId,
            isActive: true,
            effectiveFrom: { lte: oq.order.scheduledDate },
            OR: [
              { effectiveTo: null },
              { effectiveTo: { gte: oq.order.scheduledDate } }
            ]
          },
          orderBy: { effectiveFrom: 'desc' }
        });

        let unitPrice: Decimal;
        let unit: string;

        if (customerPrice) {
          unitPrice = new Decimal(customerPrice.price.toString());
          const activity = await prisma.activity.findUnique({ where: { id: activityId } });
          unit = activity?.unit || 'hour';
        } else {
          // Use hardcoded default price since Activity model doesn't have defaultPrice field
          unitPrice = new Decimal(50.00);
          const activityRecord = await prisma.activity.findUnique({ where: { id: activityId } });
          if (!activityRecord) {
            skipped++;
            continue;
          }
          unit = activityRecord.unit;
        }

        const quantity = 1; // Default quantity
        const lineTotal = unitPrice.mul(quantity);

        await prisma.orderQualification.update({
          where: { id: oq.id },
          data: {
            activityId,
            unit,
            unitPrice: unitPrice.toNumber(),
            quantity,
            lineTotal: lineTotal.toNumber()
          }
        });

        backfilled++;
      } catch (error: any) {
        console.error(`Error backfilling order qualification ${oq.id}:`, error.message);
        skipped++;
      }
    }

    console.log(`✓ Backfilled ${backfilled} order qualifications`);
    console.log(`⚠ Skipped ${skipped} order qualifications`);

    console.log('\n✅ Backfill completed successfully!');
  } catch (error) {
    console.error('❌ Backfill failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the backfill
backfillPricing()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
