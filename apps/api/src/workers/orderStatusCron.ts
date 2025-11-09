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
  
  console.log("🚀 Starting order status cron job...");
  
  cron.schedule(cronExpression, async () => {
    if (isRunning) {
      console.log("⏳ Order status check already running, skipping...");
      return;
    }
    
    isRunning = true;
    
    try {
      console.log("🔄 Daily order status check triggered");
      await OrderStatusWorker.runDailyStatusCheck();
      console.log("✅ Daily order status check completed");
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
  
  console.log("✅ Order status cron job scheduled successfully");
  console.log("📅 Next run: Daily at 00:30 UTC");
};

/**
 * Stop the order status cron job
 */
export const stopOrderStatusCron = () => {
  cron.getTasks().forEach((task) => {
    task.stop();
  });
  console.log("🛑 Order status cron job stopped");
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
  
  console.log("🔧 Manual trigger: Starting order status check...");
  isRunning = true;
  
  try {
    await OrderStatusWorker.runDailyStatusCheck();
    console.log("✅ Manual order status check completed");
  } finally {
    isRunning = false;
  }
};