import { prisma } from "@repo/db";
import { OrderStatus } from "@repo/db/src/generated/prisma";
import { OrderReminderService } from "../services/orderReminderService";

/**
 * Background worker to handle automatic order status transitions
 * Runs daily to check for orders that need status updates based on scheduled dates
 */

export class OrderStatusWorker {
  /**
   * Auto-start orders that have reached their scheduled date
   * ACTIVE orders past scheduledDate → IN_PROGRESS
   */
  static async autoStartOverdueOrders(): Promise<void> {
    try {
      console.log("🔄 Starting auto-start check for overdue orders...");
      
      const now = new Date();
      
      // Find ACTIVE orders past their scheduled date
      const overdueOrders = await prisma.order.findMany({
        where: {
          status: OrderStatus.ACTIVE,
          scheduledDate: {
            lte: now
          },
          isArchived: false
        },
        include: {
          customer: {
            select: { companyName: true }
          },
          employeeAssignments: {
            include: {
              employee: {
                select: { firstName: true, lastName: true }
              }
            }
          }
        }
      });

      if (overdueOrders.length === 0) {
        console.log("✅ No overdue orders found");
        return;
      }

      console.log(`📋 Found ${overdueOrders.length} overdue orders to auto-start`);

      // Process each overdue order
      for (const order of overdueOrders) {
        await prisma.$transaction(async (tx) => {
          // Update order status to IN_PROGRESS
          await tx.order.update({
            where: { id: order.id },
            data: {
              status: OrderStatus.IN_PROGRESS,
              startTime: now
            }
          });

          // Get first admin user as system user
          const systemUser = await tx.user.findFirst({
            where: { role: "ADMIN" }
          });
          
          if (systemUser) {
            // Create system note documenting auto-start
            await tx.orderNote.create({
              data: {
                orderId: order.id,
                authorId: systemUser.id,
                content: `Order automatically started on scheduled date at ${now.toLocaleString()}. Assigned employees should begin work immediately.`,
                category: "GENERAL_UPDATE",
                isInternal: false,
                triggersStatus: OrderStatus.IN_PROGRESS
              }
            });
            
            // Create internal tracking note for auto-start
            await tx.orderNote.create({
              data: {
                orderId: order.id,
                authorId: systemUser.id,
                content: `AUTO_START: Order automatically transitioned to IN_PROGRESS on scheduled date`,
                category: "GENERAL_UPDATE",
                isInternal: true // Internal tracking
              }
            });
          }

          console.log(`✅ Auto-started order ${order.orderNumber} for ${order.customer.companyName}`);
        });
      }

      console.log(`🎉 Successfully auto-started ${overdueOrders.length} orders`);
      
    } catch (error) {
      console.error("❌ Error in auto-start worker:", error);
      throw error;
    }
  }

  /**
   * Check for orders that should be expired
   * OPEN orders 7+ days past scheduled date → EXPIRED
   * ACTIVE orders 14+ days past scheduled date → EXPIRED
   */
  static async expireStaleOrders(): Promise<void> {
    try {
      console.log("🔄 Starting expiration check for stale orders...");
      
      const now = new Date();
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

      // Find orders to expire
      const ordersToExpire = await prisma.order.findMany({
        where: {
          OR: [
            {
              status: OrderStatus.OPEN,
              scheduledDate: { lte: sevenDaysAgo }
            },
            {
              status: OrderStatus.ACTIVE,
              scheduledDate: { lte: fourteenDaysAgo }
            }
          ],
          isArchived: false
        },
        include: {
          customer: {
            select: { companyName: true }
          }
        }
      });

      if (ordersToExpire.length === 0) {
        console.log("✅ No orders to expire");
        return;
      }

      console.log(`📋 Found ${ordersToExpire.length} orders to expire`);

      // Process each order
      for (const order of ordersToExpire) {
        await prisma.$transaction(async (tx) => {
          // Update order status to EXPIRED
          await tx.order.update({
            where: { id: order.id },
            data: {
              status: OrderStatus.EXPIRED
            }
          });

          // Create system note documenting expiration
          const daysOverdue = Math.floor(
            (now.getTime() - new Date(order.scheduledDate).getTime()) / (24 * 60 * 60 * 1000)
          );

          // Get first admin user as system user
          const systemUser = await tx.user.findFirst({
            where: { role: "ADMIN" }
          });
          
          if (systemUser) {
            await tx.orderNote.create({
              data: {
                orderId: order.id,
                authorId: systemUser.id,
                content: `Order automatically expired after ${daysOverdue} days past scheduled date with no progress.`,
                category: "GENERAL_UPDATE",
                isInternal: false,
                triggersStatus: OrderStatus.EXPIRED
              }
            });
          }

          console.log(`⏰ Expired order ${order.orderNumber} (${daysOverdue} days overdue)`);
        });
      }

      console.log(`🎉 Successfully expired ${ordersToExpire.length} orders`);
      
    } catch (error) {
      console.error("❌ Error in expiration worker:", error);
      throw error;
    }
  }

  /**
   * Main worker function - runs all order status checks
   */
  static async runDailyStatusCheck(): Promise<void> {
    console.log("🚀 Starting daily order status check...");
    
    try {
      await this.autoStartOverdueOrders();
      await this.expireStaleOrders();
      await OrderReminderService.runAllReminderChecks();
      
      console.log("✅ Daily order status check completed successfully");
    } catch (error) {
      console.error("❌ Daily order status check failed:", error);
      throw error;
    }
  }
}

// Export for cron job usage
export const runDailyOrderStatusCheck = () => OrderStatusWorker.runDailyStatusCheck();