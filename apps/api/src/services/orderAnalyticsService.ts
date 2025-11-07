import { prisma } from "@repo/db";
import { OrderStatus } from "@repo/db/src/generated/prisma";

/**
 * Service for order analytics and reporting
 * Provides insights into order completion patterns and employee performance
 */

export class OrderAnalyticsService {
  /**
   * Get start method analytics (manual vs auto-start)
   */
  static async getStartMethodAnalytics(dateRange?: { start: Date; end: Date }) {
    try {
      const whereClause: any = {
        status: { in: [OrderStatus.IN_PROGRESS, OrderStatus.IN_REVIEW, OrderStatus.COMPLETED] },
        startTime: { not: null }
      };

      if (dateRange) {
        whereClause.startTime = {
          ...whereClause.startTime,
          gte: dateRange.start,
          lte: dateRange.end
        };
      }

      // Get all orders that have been started
      const startedOrders = await prisma.order.findMany({
        where: whereClause,
        include: {
          notes: {
            where: {
              isInternal: true,
              content: {
                contains: "started"
              }
            },
            orderBy: { createdAt: 'asc' },
            take: 1
          },
          customer: {
            select: { companyName: true }
          }
        }
      });

      // Analyze start methods
      const analytics = {
        total: startedOrders.length,
        manualStarts: 0,
        autoStarts: 0,
        unknown: 0,
        averageTimeToStart: 0,
        onTimeStarts: 0,
        lateStarts: 0,
        details: [] as any[]
      };

      let totalDelayMinutes = 0;

      for (const order of startedOrders) {
        const startNote = order.notes[0];
        let startMethod = 'unknown';
        
        if (startNote) {
          if (startNote.content.includes('AUTO_START')) {
            startMethod = 'auto';
            analytics.autoStarts++;
          } else if (startNote.content.includes('manually')) {
            startMethod = 'manual';
            analytics.manualStarts++;
          } else {
            analytics.unknown++;
          }
        } else {
          analytics.unknown++;
        }

        // Calculate delay from scheduled date
        const scheduledTime = new Date(order.scheduledDate);
        const actualStartTime = new Date(order.startTime!);
        const delayMinutes = Math.floor((actualStartTime.getTime() - scheduledTime.getTime()) / (1000 * 60));
        
        if (delayMinutes <= 60) { // Within 1 hour is considered "on time"
          analytics.onTimeStarts++;
        } else {
          analytics.lateStarts++;
        }

        totalDelayMinutes += Math.max(0, delayMinutes);

        analytics.details.push({
          orderNumber: order.orderNumber,
          customerName: order.customer.companyName,
          scheduledDate: order.scheduledDate,
          actualStartTime: order.startTime,
          startMethod,
          delayMinutes,
          status: order.status
        });
      }

      analytics.averageTimeToStart = analytics.total > 0 ? 
        Math.round(totalDelayMinutes / analytics.total) : 0;

      return analytics;
      
    } catch (error) {
      console.error("Error getting start method analytics:", error);
      throw error;
    }
  }

  /**
   * Get order completion analytics
   */
  static async getCompletionAnalytics(dateRange?: { start: Date; end: Date }) {
    try {
      const whereClause: any = {
        status: { in: [OrderStatus.COMPLETED, OrderStatus.IN_PROGRESS, OrderStatus.IN_REVIEW] }
      };

      if (dateRange) {
        whereClause.scheduledDate = {
          gte: dateRange.start,
          lte: dateRange.end
        };
      }

      const orders = await prisma.order.findMany({
        where: whereClause,
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

      const analytics = {
        total: orders.length,
        completed: 0,
        inProgress: 0,
        inReview: 0,
        averageCompletionDays: 0,
        onTimeCompletions: 0,
        lateCompletions: 0,
        statusDistribution: {} as Record<string, number>
      };

      let totalCompletionDays = 0;
      let completedCount = 0;

      for (const order of orders) {
        // Count status distribution
        analytics.statusDistribution[order.status] = 
          (analytics.statusDistribution[order.status] || 0) + 1;

        switch (order.status) {
          case OrderStatus.COMPLETED:
            analytics.completed++;
            completedCount++;
            
            // Calculate completion time if we have start and end times
            if (order.startTime && order.updatedAt) {
              const completionDays = Math.floor(
                (new Date(order.updatedAt).getTime() - new Date(order.startTime).getTime()) / 
                (1000 * 60 * 60 * 24)
              );
              totalCompletionDays += completionDays;
              
              // Assume orders should be completed within 7 days
              if (completionDays <= 7) {
                analytics.onTimeCompletions++;
              } else {
                analytics.lateCompletions++;
              }
            }
            break;
          case OrderStatus.IN_PROGRESS:
            analytics.inProgress++;
            break;
          case OrderStatus.IN_REVIEW:
            analytics.inReview++;
            break;
        }
      }

      analytics.averageCompletionDays = completedCount > 0 ? 
        Math.round(totalCompletionDays / completedCount) : 0;

      return analytics;
      
    } catch (error) {
      console.error("Error getting completion analytics:", error);
      throw error;
    }
  }

  /**
   * Get employee performance analytics for orders
   */
  static async getEmployeeOrderPerformance(employeeId?: string, dateRange?: { start: Date; end: Date }) {
    try {
      const whereClause: any = {};

      if (employeeId) {
        whereClause.employeeId = employeeId;
      }

      if (dateRange) {
        whereClause.order = {
          scheduledDate: {
            gte: dateRange.start,
            lte: dateRange.end
          }
        };
      }

      const assignments = await prisma.assignment.findMany({
        where: whereClause,
        include: {
          employee: {
            select: { 
              id: true,
              firstName: true, 
              lastName: true,
              performanceScore: true 
            }
          },
          order: {
            select: {
              orderNumber: true,
              status: true,
              scheduledDate: true,
              startTime: true,
              customer: {
                select: { companyName: true }
              }
            }
          }
        }
      });

      // Group by employee
      const employeeStats = new Map();

      for (const assignment of assignments) {
        const empId = assignment.employee.id;
        
        if (!employeeStats.has(empId)) {
          employeeStats.set(empId, {
            employee: assignment.employee,
            totalAssignments: 0,
            completedOrders: 0,
            inProgressOrders: 0,
            averageStartDelay: 0,
            onTimeStarts: 0,
            lateStarts: 0
          });
        }

        const stats = employeeStats.get(empId);
        stats.totalAssignments++;

        if (assignment.order?.status === OrderStatus.COMPLETED) {
          stats.completedOrders++;
        } else if (assignment.order?.status === OrderStatus.IN_PROGRESS) {
          stats.inProgressOrders++;
        }

        // Calculate start delay if order has started
        if (assignment.order?.startTime) {
          const scheduledTime = new Date(assignment.order.scheduledDate);
          const actualStartTime = new Date(assignment.order.startTime);
          const delayMinutes = Math.floor(
            (actualStartTime.getTime() - scheduledTime.getTime()) / (1000 * 60)
          );

          if (delayMinutes <= 60) {
            stats.onTimeStarts++;
          } else {
            stats.lateStarts++;
          }
        }
      }

      return Array.from(employeeStats.values());
      
    } catch (error) {
      console.error("Error getting employee order performance:", error);
      throw error;
    }
  }
}