import { prisma } from "@repo/db";

/**
 * Service to handle customer activity validation and isolation
 */
export class CustomerActivityService {
  /**
   * Validate that an activity is available for a specific customer
   */
  static async validateActivityForCustomer(customerId: string, customerActivityId: string): Promise<boolean> {
    const hasValidPricing = await prisma.customerPrice.findFirst({
      where: {
        customerId,
        customerActivityId,
        isActive: true,
        effectiveFrom: { lte: new Date() },
        OR: [
          { effectiveTo: null },
          { effectiveTo: { gte: new Date() } }
        ]
      }
    });

    return !!hasValidPricing;
  }

  /**
   * Get activities available for a specific customer
   */
  static async getCustomerActivities(customerId: string) {
    return prisma.customerActivity.findMany({
      where: {
        customerId, // Ensure we check customer ownership of definition
        orderId: null, // Definitions only
        isActive: true,
        // We might valid pricing check or just return all definitions?
        // Let's keep pricing check logic if we want "available" activities.
        prices: {
          some: {
            customerId,
            isActive: true,
            effectiveFrom: { lte: new Date() },
            OR: [
              { effectiveTo: null },
              { effectiveTo: { gte: new Date() } }
            ]
          }
        }
      },
      include: {
        prices: {
          where: {
            customerId,
            isActive: true,
            effectiveFrom: { lte: new Date() },
            OR: [
              { effectiveTo: null },
              { effectiveTo: { gte: new Date() } }
            ]
          },
          orderBy: { minQuantity: 'asc' }
        }
      },
      orderBy: { name: 'asc' }
    });
  }

  /**
   * Validate that customer activities belong to the correct customer
   */
  static async validateCustomerActivityOwnership(customerId: string, customerActivityIds: string[]): Promise<boolean> {
    const count = await prisma.customerActivity.count({
      where: {
        id: { in: customerActivityIds },
        customerId
      }
    });

    return count === customerActivityIds.length;
  }

  /**
   * Get customer activities for a specific order with validation
   */
  static async getOrderCustomerActivities(orderId: string) {
    // First get the order to ensure we have the customer context
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: { customerId: true }
    });

    if (!order) {
      throw new Error('Order not found');
    }

    // Get customer activities that belong to this specific customer and order
    return prisma.customerActivity.findMany({
      where: {
        orderId,
        customerId: order.customerId, // Ensure activities belong to the same customer
        isActive: true
      },
      // Activity fields are now on the model itself, no need to include activity
      orderBy: { createdAt: 'desc' }
    });
  }

  /**
   * Create customer activity with validation
   */
  static async createCustomerActivity(data: {
    customerId: string;
    customerActivityId: string; // The Definition ID
    orderId?: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
  }) {
    // Validate that the activity is available for this customer
    const isValid = await this.validateActivityForCustomer(data.customerId, data.customerActivityId);
    if (!isValid) {
      throw new Error('Activity is not available for this customer');
    }

    // Fetch the definition to copy fields
    const definition = await prisma.customerActivity.findUnique({
      where: { id: data.customerActivityId }
    });

    if (!definition || definition.orderId !== null) {
      throw new Error('Invalid Activity Definition');
    }

    // If orderId is provided, validate that the order belongs to the same customer
    if (data.orderId) {
      const order = await prisma.order.findUnique({
        where: { id: data.orderId },
        select: { customerId: true }
      });

      if (!order || order.customerId !== data.customerId) {
        throw new Error('Order does not belong to the specified customer');
      }
    }

    return prisma.customerActivity.create({
      data: {
        customerId: data.customerId,
        // No relation link to definition? We copy fields.
        orderId: data.orderId,
        quantity: data.quantity,
        unitPrice: data.unitPrice,
        lineTotal: data.lineTotal,
        isActive: true,

        // Copied fields
        name: definition.name,
        type: definition.type,
        code: definition.code,
        description: definition.description,
        unit: definition.unit
      }
    });
  }

  /**
   * Update customer activity with validation
   */
  static async updateCustomerActivity(
    customerActivityId: string,
    customerId: string,
    data: {
      quantity?: number;
      unitPrice?: number;
      lineTotal?: number;
    }
  ) {
    // Validate ownership
    const customerActivity = await prisma.customerActivity.findFirst({
      where: {
        id: customerActivityId,
        customerId
      }
    });

    if (!customerActivity) {
      throw new Error('Customer activity not found or access denied');
    }

    return prisma.customerActivity.update({
      where: { id: customerActivityId },
      data
    });
  }

  /**
   * Delete customer activity with validation
   */
  static async deleteCustomerActivity(customerActivityId: string, customerId: string) {
    // Validate ownership
    const customerActivity = await prisma.customerActivity.findFirst({
      where: {
        id: customerActivityId,
        customerId
      }
    });

    if (!customerActivity) {
      throw new Error('Customer activity not found or access denied');
    }

    // Soft delete by setting isActive to false
    return prisma.customerActivity.update({
      where: { id: customerActivityId },
      data: { isActive: false }
    });
  }

  /**
   * Get customer activity statistics
   */
  static async getCustomerActivityStatistics(
    customerId: string,
    options?: {
      startDate?: Date;
      endDate?: Date;
      activityIds?: string[];
    }
  ) {
    const whereClause: any = {
      customerId,
      isActive: true
    };

    if (options?.startDate || options?.endDate) {
      whereClause.createdAt = {};
      if (options.startDate) whereClause.createdAt.gte = options.startDate;
      if (options.endDate) whereClause.createdAt.lte = options.endDate;
    }

    if (options?.activityIds?.length) {
      // Filtering by ID for statistics might be tricky if we don't link to definition.
      // But assuming we want stats for *instances* created from these *definitions*...
      // If we didn't link them, we can't easily filter by "Original Definition ID".
      // We'd have to filter by Name?
      // For now, let's assume we can filter by 'name' if we fetch definitions first.
      // OR we skip this filter implementation for now or use name matching.
      const definitions = await prisma.customerActivity.findMany({
        where: { id: { in: options.activityIds } },
        select: { name: true }
      });
      const names = definitions.map(d => d.name);
      whereClause.name = { in: names };
    }

    const stats = await prisma.customerActivity.groupBy({
      by: ['name', 'unit', 'code', 'type'], // Group by multiple fields to be safe? Or just name.
      where: {
        ...whereClause,
        orderId: { not: null } // Only instances
      },
      _sum: {
        quantity: true,
        lineTotal: true
      },
      _count: {
        id: true
      }
    });

    // We don't need to fetch "activity details" separately because we have them in the group key!
    return stats.map(stat => {
      return {
        activity: {
          id: 'aggregate', // Dummy ID
          name: stat.name,
          code: stat.code,
          unit: stat.unit,
          type: stat.type
        },
        totalQuantity: stat._sum.quantity || 0,
        totalValue: stat._sum.lineTotal || 0,
        orderCount: stat._count.id
      };
    });
  }
}