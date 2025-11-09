import cron from "node-cron";
import { OrderReminderService } from "../services/orderReminderService";

/**
 * Hourly cron job for sending order reminders
 * Runs every hour to check for orders starting soon
 */

let isRunning = false;

export const startHourlyReminderCron = () => {
  // Run every hour at minute 15 (e.g., 9:15, 10:15, 11:15)
  const cronExpression = "15 * * * *"; // Every hour at minute 15
  
  console.log("🔔 Starting hourly reminder cron job...");
  
  cron.schedule(cronExpression, async () => {
    if (isRunning) {
      console.log("⏳ Hourly reminder check already running, skipping...");
      return;
    }
    
    isRunning = true;
    
    try {
      console.log("🔔 Hourly reminder check triggered");
      await OrderReminderService.sendHourlyReminders();
      console.log("✅ Hourly reminder check completed");
    } catch (error) {
      console.error("❌ Hourly reminder check failed:", error);
    } finally {
      isRunning = false;
    }
  }, {
    timezone: "UTC"
  });
  
  console.log("✅ Hourly reminder cron job scheduled successfully");
  console.log("📅 Next run: Every hour at minute 15 UTC");
};

/**
 * Stop the hourly reminder cron job
 */
export const stopHourlyReminderCron = () => {
  cron.getTasks().forEach((task) => {
    task.stop();
  });
  console.log("🛑 Hourly reminder cron job stopped");
};

/**
 * Get status of the hourly reminder cron job
 */
export const getHourlyReminderCronStatus = () => {
  const tasks = cron.getTasks();
  return {
    isRunning: tasks.size > 0,
    taskCount: tasks.size,
    nextRun: "Every hour at minute 15 UTC",
    currentlyProcessing: isRunning
  };
};