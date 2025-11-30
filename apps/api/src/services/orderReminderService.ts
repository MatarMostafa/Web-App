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
        return;
      }

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
       }
   
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
        return;
      }

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
            }


    } catch (error) {
      throw error;
    }
  }

  /**
   * Send reminders for overdue IN_PROGRESS orders
   */
  static async sendOverdueReminders(): Promise<void> {
    try {
      
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
        return;
      }


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
            }

      
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

    } catch (error) {
      console.error(`❌ Failed to create notification for user ${data.userId}:`, error);
      // Don't throw - continue with other notifications
    }
  }

  /**
   * Run all reminder checks
   */
  static async runAllReminderChecks(): Promise<void> {
    
    try {
      await this.sendTomorrowReminders();
      await this.sendHourlyReminders();
      await this.sendOverdueReminders();
      
    } catch (error) {
      console.error("❌ Reminder checks failed:", error);
      throw error;
    }
  }
}