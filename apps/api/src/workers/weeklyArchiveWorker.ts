import cron from "node-cron";
import { archivePreviousWeekOrders, shouldRunArchiveProcess } from "../services/weeklyArchiveService";

/**
 * Weekly archive worker that runs every Monday at midnight
 * Archives orders from the previous week (Monday to Sunday)
 */
export const startWeeklyArchiveWorker = () => {
  // Run every Monday at 00:01 (1 minute past midnight)
  // Cron format: minute hour day-of-month month day-of-week
  // day-of-week: 0 = Sunday, 1 = Monday, etc.
  const cronExpression = "1 0 * * 1"; // Every Monday at 00:01
  
  console.log("Starting weekly archive worker...");
  
  cron.schedule(cronExpression, async () => {
    try {
      console.log("Weekly archive worker triggered - checking if should run...");
      
      if (shouldRunArchiveProcess()) {
        console.log("Running weekly archive process...");
        const result = await archivePreviousWeekOrders();
        
        console.log(`Weekly archive completed successfully:`, {
          archivedCount: result.archivedCount,
          timestamp: new Date().toISOString(),
        });
        
        // Log details of archived orders
        if (result.orders.length > 0) {
          console.log("Archived orders:", result.orders.map(order => ({
            orderNumber: order.orderNumber,
            title: order.title,
            scheduledDate: order.scheduledDate,
            status: order.status,
          })));
        }
      } else {
        console.log("Archive process skipped - not the right time");
      }
    } catch (error) {
      console.error("Weekly archive worker error:", error);
      
      // In a production environment, you might want to:
      // 1. Send an alert/notification to administrators
      // 2. Log to an error tracking service
      // 3. Retry the operation after a delay
    }
  }, {
    timezone: "UTC" // Use UTC to avoid timezone issues
  });
  
  console.log("Weekly archive worker scheduled successfully");
  console.log("Next run: Every Monday at 00:01 UTC");
};

/**
 * Stop the weekly archive worker (for graceful shutdown)
 */
export const stopWeeklyArchiveWorker = () => {
  cron.getTasks().forEach((task) => {
    task.stop();
  });
  console.log("Weekly archive worker stopped");
};

/**
 * Get the status of the weekly archive worker
 */
export const getWeeklyArchiveWorkerStatus = () => {
  const tasks = cron.getTasks();
  return {
    isRunning: tasks.size > 0,
    taskCount: tasks.size,
    nextRun: "Every Monday at 00:01 UTC",
  };
};