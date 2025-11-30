import cron from "node-cron";
import { OrderStatusWorker } from "./orderStatusWorker";

/**
 * Cron job scheduler for order status worker
 * Runs daily to check for orders that need automatic status updates
 */

let isRunning = false;

export const startOrderStatusCron = () => {
  // Run every day at 00:30 (30 minutes past midnight)
  // This gives time for other midnight processes to complete
  const cronExpression = "30 0 * * *"; // Daily at 00:30
  
  cron.schedule(cronExpression, async () => {
    if (isRunning) {
      return;
    }
    
    isRunning = true;
    
    try {
      await OrderStatusWorker.runDailyStatusCheck();
    } catch (error) {
      console.error("❌ Daily order status check failed:", error);
      
      // In production, you might want to:
      // 1. Send alert to administrators
      // 2. Log to error tracking service
      // 3. Retry after delay
    } finally {
      isRunning = false;
    }
  }, {
    timezone: "UTC" // Use UTC to avoid timezone issues
  });
  
};

/**
 * Stop the order status cron job
 */
export const stopOrderStatusCron = () => {
  cron.getTasks().forEach((task) => {
    task.stop();
  });
};

/**
 * Get status of the cron job
 */
export const getOrderStatusCronStatus = () => {
  const tasks = cron.getTasks();
  return {
    isRunning: tasks.size > 0,
    taskCount: tasks.size,
    nextRun: "Daily at 00:30 UTC",
    currentlyProcessing: isRunning
  };
};

/**
 * Manual trigger for testing (don't use in production)
 */
export const triggerOrderStatusCheckManually = async () => {
  if (isRunning) {
    throw new Error("Order status check already running");
  }

  isRunning = true;
  
  try {
    await OrderStatusWorker.runDailyStatusCheck();
  } finally {
    isRunning = false;
  }
};