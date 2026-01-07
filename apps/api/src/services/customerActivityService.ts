import { prisma } from "@repo/db";

/**
 * Service to handle customer activity validation and isolation
 */
export class CustomerActivityService {
  /**
   * Validate that an activity is available for a specific customer
   */
  static async validateActivityForCustomer(customerId: string, activityId: string): Promise<boolean> {
    const hasValidPricing = await prisma.customerPrice.findFirst({
      where: {
        customerId,
        activityId,
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
    return prisma.activity.findMany({
      where: {
        isActive: true,
        customerPrices: {
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
        customerPrices: {
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
      include: {
        activity: {
          select: {
            id: true,
            name: true,
            code: true,
            description: true,
            unit: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  /**
   * Create customer activity with validation
   */
  static async createCustomerActivity(data: {
    customerId: string;
    activityId: string;
    orderId?: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
  }) {
    // Validate that the activity is available for this customer
    const isValid = await this.validateActivityForCustomer(data.customerId, data.activityId);
    if (!isValid) {
      throw new Error('Activity is not available for this customer');
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
        activityId: data.activityId,
        orderId: data.orderId,
        quantity: data.quantity,
        unitPrice: data.unitPrice,
        lineTotal: data.lineTotal,
        isActive: true
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
      whereClause.activityId = { in: options.activityIds };
    }

    const stats = await prisma.customerActivity.groupBy({
      by: ['activityId'],
      where: whereClause,
      _sum: {
        quantity: true,
        lineTotal: true
      },
      _count: {
        id: true
      }
    });

    // Get activity details
    const activityIds = stats.map(stat => stat.activityId);
    const activities = await prisma.activity.findMany({
      where: { id: { in: activityIds } },
      select: { id: true, name: true, code: true, unit: true }
    });

    // Combine stats with activity details
    return stats.map(stat => {
      const activity = activities.find(a => a.id === stat.activityId);
      return {
        activity,
        totalQuantity: stat._sum.quantity || 0,
        totalValue: stat._sum.lineTotal || 0,
        orderCount: stat._count.id
      };
    });
  }
}