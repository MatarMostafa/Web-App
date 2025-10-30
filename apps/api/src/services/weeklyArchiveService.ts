import { prisma } from "@repo/db";

// Helper function to get start and end of current week (Monday to Sunday)
const getCurrentWeekRange = () => {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
  const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // If Sunday, go back 6 days to Monday
  
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - daysToMonday);
  startOfWeek.setHours(0, 0, 0, 0);
  
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);
  
  return { startOfWeek, endOfWeek };
};

// Helper function to get previous week range
const getPreviousWeekRange = () => {
  const { startOfWeek } = getCurrentWeekRange();
  const endOfPreviousWeek = new Date(startOfWeek);
  endOfPreviousWeek.setMilliseconds(-1); // End just before current week starts
  
  const startOfPreviousWeek = new Date(endOfPreviousWeek);
  startOfPreviousWeek.setDate(endOfPreviousWeek.getDate() - 6);
  startOfPreviousWeek.setHours(0, 0, 0, 0);
  
  return { startOfPreviousWeek, endOfPreviousWeek };
};

/**
 * Archives orders from the previous week by updating their archive status
 * This function should be called every Monday at midnight
 */
export const archivePreviousWeekOrders = async () => {
  try {
    const { startOfPreviousWeek, endOfPreviousWeek } = getPreviousWeekRange();
    
    console.log(`Archiving orders from ${startOfPreviousWeek.toISOString()} to ${endOfPreviousWeek.toISOString()}`);
    
    // Find all orders from the previous week
    const ordersToArchive = await prisma.order.findMany({
      where: {
        scheduledDate: {
          gte: startOfPreviousWeek,
          lte: endOfPreviousWeek,
        },
        // Only archive orders that are not already archived
        isArchived: false,
      },

    });
    
    if (ordersToArchive.length === 0) {
      console.log("No orders to archive for the previous week");
      return { archivedCount: 0, orders: [] };
    }
    
    // Update orders to mark them as archived
    const updateResult = await prisma.order.updateMany({
      where: {
        id: {
          in: ordersToArchive.map(order => order.id),
        },
      },
      data: {
        isArchived: true,
        archivedAt: new Date(),
      },
    });
    
    console.log(`Successfully archived ${updateResult.count} orders from previous week`);
    
    return {
      archivedCount: updateResult.count,
      orders: ordersToArchive.map(order => ({
        id: order.id,
        orderNumber: order.orderNumber,
        title: order.title,
        scheduledDate: order.scheduledDate,
        status: order.status,
        assignedEmployees: [],
      })),
    };
  } catch (error) {
    console.error("Error archiving previous week orders:", error);
    throw error;
  }
};

/**
 * Gets the current week range for filtering orders
 */
export const getCurrentWeekOrdersFilter = () => {
  return getCurrentWeekRange();
};

/**
 * Checks if it's Monday and time to run the archive process
 */
export const shouldRunArchiveProcess = () => {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday
  const hour = now.getHours();
  
  // Run on Monday (day 1) between midnight and 1 AM
  return dayOfWeek === 1 && hour === 0;
};

/**
 * Manual trigger for archiving (for testing or manual execution)
 */
export const manualArchiveTrigger = async () => {
  console.log("Manual archive trigger initiated");
  return await archivePreviousWeekOrders();
};