import { prisma } from "@repo/db";
import { OrderStatus } from "@repo/db/src/generated/prisma";

/**
 * Service for handling order reminder notifications
 * Sends reminders to employees about upcoming and overdue orders
 */

export class OrderReminderService {
  /**
   * Send reminders for orders starting tomorrow
   */
  static async sendTomorrowReminders(): Promise<void> {
    try {
      console.log("📅 Checking for orders starting tomorrow...");
      
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      
      const dayAfterTomorrow = new Date(tomorrow);
      dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);
      
      // Find ACTIVE orders scheduled for tomorrow
      const tomorrowOrders = await prisma.order.findMany({
        where: {
          status: OrderStatus.ACTIVE,
          scheduledDate: {
            gte: tomorrow,
            lt: dayAfterTomorrow
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
                include: {
                  user: {
                    select: { id: true, email: true }
                  }
                }
              }
            }
          }
        }
      });

      if (tomorrowOrders.length === 0) {
        console.log("✅ No orders starting tomorrow");
        return;
      }

      console.log(`📋 Found ${tomorrowOrders.length} orders starting tomorrow`);

      // Send reminders for each order
      for (const order of tomorrowOrders) {
        for (const assignment of order.employeeAssignments) {
          await this.createReminderNotification({
            userId: assignment.employee.user.id,
            orderId: order.id,
            orderNumber: order.orderNumber,
            customerName: order.customer.companyName,
            scheduledDate: order.scheduledDate,
            type: "TOMORROW_REMINDER",
            message: `Reminder: Order #${order.orderNumber} for ${order.customer.companyName} is scheduled to start tomorrow.`
          });
        }
        
        console.log(`📨 Sent tomorrow reminders for order ${order.orderNumber}`);
      }

      console.log(`🎉 Successfully sent reminders for ${tomorrowOrders.length} orders`);
      
    } catch (error) {
      console.error("❌ Error sending tomorrow reminders:", error);
      throw error;
    }
  }

  /**
   * Send reminders for orders starting in 1 hour
   */
  static async sendHourlyReminders(): Promise<void> {
    try {
      console.log("⏰ Checking for orders starting in 1 hour...");
      
      const now = new Date();
      const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);
      const twoHoursFromNow = new Date(now.getTime() + 2 * 60 * 60 * 1000);
      
      // Find ACTIVE orders with startTime in the next hour
      const upcomingOrders = await prisma.order.findMany({
        where: {
          status: OrderStatus.ACTIVE,
          startTime: {
            gte: oneHourFromNow,
            lt: twoHoursFromNow
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
                include: {
                  user: {
                    select: { id: true, email: true }
                  }
                }
              }
            }
          }
        }
      });

      if (upcomingOrders.length === 0) {
        console.log("✅ No orders starting in the next hour");
        return;
      }

      console.log(`📋 Found ${upcomingOrders.length} orders starting in 1 hour`);

      // Send reminders for each order
      for (const order of upcomingOrders) {
        for (const assignment of order.employeeAssignments) {
          await this.createReminderNotification({
            userId: assignment.employee.user.id,
            orderId: order.id,
            orderNumber: order.orderNumber,
            customerName: order.customer.companyName,
            scheduledDate: order.startTime!,
            type: "HOURLY_REMINDER",
            message: `Urgent: Order #${order.orderNumber} for ${order.customer.companyName} starts in 1 hour. Please prepare to begin work.`
          });
        }
        
        console.log(`📨 Sent hourly reminders for order ${order.orderNumber}`);
      }

      console.log(`🎉 Successfully sent hourly reminders for ${upcomingOrders.length} orders`);
      
    } catch (error) {
      console.error("❌ Error sending hourly reminders:", error);
      throw error;
    }
  }

  /**
   * Send reminders for overdue IN_PROGRESS orders
   */
  static async sendOverdueReminders(): Promise<void> {
    try {
      console.log("⚠️ Checking for overdue IN_PROGRESS orders...");
      
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      
      // Find IN_PROGRESS orders that started 3+ days ago
      const overdueOrders = await prisma.order.findMany({
        where: {
          status: OrderStatus.IN_PROGRESS,
          startTime: {
            lte: threeDaysAgo
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
                include: {
                  user: {
                    select: { id: true, email: true }
                  }
                }
              }
            }
          }
        }
      });

      if (overdueOrders.length === 0) {
        console.log("✅ No overdue orders found");
        return;
      }

      console.log(`📋 Found ${overdueOrders.length} overdue orders`);

      // Send overdue reminders
      for (const order of overdueOrders) {
        const daysOverdue = Math.floor(
          (new Date().getTime() - new Date(order.startTime!).getTime()) / (24 * 60 * 60 * 1000)
        );
        
        for (const assignment of order.employeeAssignments) {
          await this.createReminderNotification({
            userId: assignment.employee.user.id,
            orderId: order.id,
            orderNumber: order.orderNumber,
            customerName: order.customer.companyName,
            scheduledDate: order.startTime!,
            type: "OVERDUE_REMINDER",
            message: `Overdue: Order #${order.orderNumber} for ${order.customer.companyName} has been in progress for ${daysOverdue} days. Please update status or mark as complete.`
          });
        }
        
        console.log(`⚠️ Sent overdue reminders for order ${order.orderNumber} (${daysOverdue} days)`);
      }

      console.log(`🎉 Successfully sent overdue reminders for ${overdueOrders.length} orders`);
      
    } catch (error) {
      console.error("❌ Error sending overdue reminders:", error);
      throw error;
    }
  }

  /**
   * Create a reminder notification in the database
   */
  private static async createReminderNotification(data: {
    userId: string;
    orderId: string;
    orderNumber: string;
    customerName: string;
    scheduledDate: Date;
    type: string;
    message: string;
  }): Promise<void> {
    try {
      // Create notification
      const notification = await prisma.notification.create({
        data: {
          title: `Order Reminder: #${data.orderNumber}`,
          body: data.message,
          category: "order_reminder",
          data: {
            orderId: data.orderId,
            orderNumber: data.orderNumber,
            customerName: data.customerName,
            scheduledDate: data.scheduledDate.toISOString(),
            reminderType: data.type
          },
          createdBy: null // Will be handled by notification system
        }
      });

      // Create notification recipient
      await prisma.notificationRecipient.create({
        data: {
          notificationId: notification.id,
          userId: data.userId,
          channels: ["in_app", "email"],
          status: "PENDING"
        }
      });

      console.log(`📨 Created ${data.type} notification for user ${data.userId}`);
      
    } catch (error) {
      console.error(`❌ Failed to create notification for user ${data.userId}:`, error);
      // Don't throw - continue with other notifications
    }
  }

  /**
   * Run all reminder checks
   */
  static async runAllReminderChecks(): Promise<void> {
    console.log("🔔 Starting reminder notification checks...");
    
    try {
      await this.sendTomorrowReminders();
      await this.sendHourlyReminders();
      await this.sendOverdueReminders();
      
      console.log("✅ All reminder checks completed successfully");
    } catch (error) {
      console.error("❌ Reminder checks failed:", error);
      throw error;
    }
  }
}