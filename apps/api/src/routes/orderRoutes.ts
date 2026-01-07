import express, { Request, Response } from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import { roleMiddleware } from "../middleware/roleMiddleware";
import { validateRequest } from "../middleware/validateRequest";
import {
  createOrderSchema,
  updateOrderSchema,
  deleteOrderSchema,
  updateOrderStatusSchema,
  createAssignmentSchema,
  updateAssignmentSchema,
  deleteAssignmentSchema,
  updateAssignmentStatusSchema,
  createOrderAssignmentSchema,
  deleteOrderAssignmentSchema,
  createOrderQualificationSchema,
  deleteOrderQualificationSchema,
  createOrderRatingSchema,
  deleteOrderRatingSchema,
  updateOrderRatingSchema,
  autoAssignEmployeesSchema,
} from "../validation/orderSchemas";
import {
  createOrderNoteRequestSchema,
  updateOrderNoteRequestSchema,
  getOrderNotesRequestSchema,
  getOrderNoteByIdRequestSchema,
  deleteOrderNoteRequestSchema,
  getOrderNotesCountRequestSchema,
} from "../validation/orderNotesSchemas";
import { OrderAnalyticsService } from "../services/orderAnalyticsService";
import { z } from "zod";
import { prisma } from "@repo/db";
import {
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrder,
  deleteOrder,
  updateOrderStatus,
  getOrderSummary,
  getAssignments,
  getAssignedEmployeeIds,
  createAssignment,
  updateAssignment,
  deleteAssignment,
  updateAssignmentStatus,
  autoAssignEmployees,
  getOrderAssignments,
  createOrderAssignment,
  deleteOrderAssignment,
  getOrderQualifications,
  createOrderQualification,
  deleteOrderQualification,
  getOrderRatings,
  createOrderRating,
  updateOrderRating,
  deleteOrderRating,
  getOrderActivities,
} from "../controllers/orderController";
import {
  getOrderNotes,
  createOrderNote,
  getOrderNoteById,
  updateOrderNote,
  deleteOrderNote,
  getOrderNotesCount,
} from "../controllers/orderNotesController";


const router = express.Router();

/**
 * @section Orders
 */
router.get(
  "/",
  authMiddleware,
  roleMiddleware(["ADMIN", "TEAM_LEADER"]),
  getAllOrders
);

router.get(
  "/:id",
  authMiddleware,
  roleMiddleware(["ADMIN", "TEAM_LEADER"]),
  getOrderById
);

router.post(
  "/",
  authMiddleware,
  roleMiddleware(["ADMIN", "TEAM_LEADER"]),
  validateRequest(createOrderSchema),
  createOrder
);

router.put(
  "/:id",
  authMiddleware,
  roleMiddleware(["ADMIN", "TEAM_LEADER"]),
  validateRequest(updateOrderSchema),
  updateOrder
);

router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware(["ADMIN", "TEAM_LEADER"]),
  validateRequest(deleteOrderSchema),
  deleteOrder
);

router.patch(
  "/:id/status",
  authMiddleware,
  roleMiddleware(["ADMIN", "TEAM_LEADER"]),
  validateRequest(updateOrderStatusSchema),
  updateOrderStatus
);

router.get(
  "/:id/summary",
  authMiddleware,
  roleMiddleware(["ADMIN", "TEAM_LEADER"]),
  getOrderSummary
);

/**
 * @section Assignments
 */
router.get(
  "/:orderId/assignments",
  authMiddleware,
  roleMiddleware(["ADMIN", "TEAM_LEADER", "EMPLOYEE"]),
  getAssignments
);

router.get(
  "/:orderId/assigned-employees",
  authMiddleware,
  roleMiddleware(["ADMIN", "TEAM_LEADER"]),
  getAssignedEmployeeIds
);

router.post(
  "/:orderId/assignments",
  authMiddleware,
  roleMiddleware(["ADMIN", "TEAM_LEADER"]),
  validateRequest(createAssignmentSchema),
  createAssignment
);

router.put(
  "/assignments/:id",
  authMiddleware,
  roleMiddleware(["ADMIN", "TEAM_LEADER"]),
  validateRequest(updateAssignmentSchema),
  updateAssignment
);

router.delete(
  "/assignments/:id",
  authMiddleware,
  roleMiddleware(["ADMIN", "TEAM_LEADER"]),
  validateRequest(deleteAssignmentSchema),
  deleteAssignment
);

router.patch(
  "/assignments/:id/status",
  authMiddleware,
  roleMiddleware(["ADMIN", "TEAM_LEADER"]),
  validateRequest(updateAssignmentStatusSchema),
  updateAssignmentStatus
);

router.post(
  "/:orderId/assignments/auto",
  authMiddleware,
  roleMiddleware(["ADMIN", "TEAM_LEADER"]),
  validateRequest(autoAssignEmployeesSchema),
  autoAssignEmployees
);

router.post(
  "/:orderId/assignments/bulk",
  authMiddleware,
  roleMiddleware(["ADMIN", "TEAM_LEADER"]),
  validateRequest(z.object({
    params: z.object({ orderId: z.string().cuid() }),
    body: z.object({ employeeIds: z.array(z.string().cuid()) })
  })),
  async (req: Request, res: Response) => {
    try {
      const { orderId } = req.params;
      const { employeeIds } = req.body;
      
      // Remove existing assignments
      await prisma.assignment.deleteMany({ where: { orderId } });
      
      // Update order's requiredEmployees count
      await prisma.order.update({
        where: { id: orderId },
        data: { requiredEmployees: employeeIds.length || 1 }
      });
      
      // Create new assignments
      const assignments = await Promise.all(
        employeeIds.map((employeeId: string) =>
          prisma.assignment.create({
            data: {
              orderId,
              employeeId,
              assignedDate: new Date(),
              status: "ASSIGNED",
            },
          })
        )
      );
      
      res.json({ message: "Mitarbeiter erfolgreich zugewiesen", assignments });
    } catch (error) {
      console.error("Bulk assignment error:", error);
      res.status(400).json({ 
        message: "Fehler beim Zuweisen der Mitarbeiter", 
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }
);

/**
 * @section OrderAssignments
 */
router.get(
  "/:orderId/order-assignments",
  authMiddleware,
  roleMiddleware(["ADMIN", "TEAM_LEADER"]),
  getOrderAssignments
);

router.post(
  "/:orderId/order-assignments",
  authMiddleware,
  roleMiddleware(["ADMIN", "TEAM_LEADER"]),
  validateRequest(createOrderAssignmentSchema),
  createOrderAssignment
);

router.delete(
  "/order-assignments/:id",
  authMiddleware,
  roleMiddleware(["ADMIN", "TEAM_LEADER"]),
  validateRequest(deleteOrderAssignmentSchema),
  deleteOrderAssignment
);

/**
 * @section OrderQualifications
 */
router.get(
  "/:orderId/qualifications",
  authMiddleware,
  roleMiddleware(["ADMIN", "TEAM_LEADER"]),
  getOrderQualifications
);

router.post(
  "/:orderId/qualifications",
  authMiddleware,
  roleMiddleware(["ADMIN", "TEAM_LEADER"]),
  validateRequest(createOrderQualificationSchema),
  createOrderQualification
);

router.delete(
  "/order-qualifications/:id",
  authMiddleware,
  roleMiddleware(["ADMIN", "TEAM_LEADER"]),
  validateRequest(deleteOrderQualificationSchema),
  deleteOrderQualification
);

/**
 * @section Ratings
 */
router.get(
  "/:orderId/ratings",
  authMiddleware,
  roleMiddleware(["ADMIN", "TEAM_LEADER"]),
  getOrderRatings
);

router.post(
  "/:orderId/ratings",
  authMiddleware,
  roleMiddleware(["ADMIN", "TEAM_LEADER"]),
  validateRequest(createOrderRatingSchema),

  createOrderRating
);

router.patch(
  "/ratings/:id",
  authMiddleware,
  roleMiddleware(["ADMIN", "TEAM_LEADER"]),
  validateRequest(updateOrderRatingSchema),
  updateOrderRating
);

router.delete(
  "/ratings/:id",
  authMiddleware,
  roleMiddleware(["ADMIN", "TEAM_LEADER"]),
  validateRequest(deleteOrderRatingSchema),
  deleteOrderRating
);

/**
 * @section Order Notes
 */
router.get(
  "/:orderId/notes",
  authMiddleware,
  validateRequest(getOrderNotesRequestSchema),
  getOrderNotes
);

router.post(
  "/:orderId/notes",
  authMiddleware,
  validateRequest(createOrderNoteRequestSchema),
  createOrderNote
);

router.get(
  "/:orderId/notes/count",
  authMiddleware,
  validateRequest(getOrderNotesCountRequestSchema),
  getOrderNotesCount
);

router.get(
  "/:orderId/notes/:noteId",
  authMiddleware,
  validateRequest(getOrderNoteByIdRequestSchema),
  getOrderNoteById
);

router.put(
  "/:orderId/notes/:noteId",
  authMiddleware,
  validateRequest(updateOrderNoteRequestSchema),
  updateOrderNote
);

router.delete(
  "/:orderId/notes/:noteId",
  authMiddleware,
  validateRequest(deleteOrderNoteRequestSchema),
  deleteOrderNote
);

/**
 * @section Order Activities
 */
router.get(
  "/:orderId/activities",
  authMiddleware,
  roleMiddleware(["ADMIN", "TEAM_LEADER", "EMPLOYEE"]),
  getOrderActivities
);

router.get(
  "/:orderId/activity-ids",
  authMiddleware,
  roleMiddleware(["ADMIN", "TEAM_LEADER"]),
  async (req: Request, res: Response) => {
    try {
      const { orderId } = req.params;
      console.log(`Fetching activity IDs for order: ${orderId}`);
      
      // First get the order to ensure we have the customer context
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        select: { customerId: true }
      });
      
      if (!order) {
        return res.status(404).json({ 
          success: false, 
          message: "Order not found" 
        });
      }
      
      // Get customer activities that belong to this specific customer and order
      const customerActivities = await prisma.customerActivity.findMany({
        where: { 
          orderId,
          customerId: order.customerId, // Ensure activities belong to the same customer
          isActive: true
        },
        select: { activityId: true }
      });
      
      console.log(`Found ${customerActivities.length} customer activities for order ${orderId}:`, customerActivities);
      
      const activityIds = customerActivities.map(ca => ca.activityId);
      console.log(`Returning activity IDs:`, activityIds);
      
      res.json({ success: true, data: activityIds });
    } catch (error) {
      console.error("Get order activity IDs error:", error);
      res.status(500).json({ 
        success: false,
        message: "Fehler beim Abrufen der Aktivitäts-IDs", 
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }
);

/**
 * @section Analytics
 */
router.get(
  "/analytics/start-methods",
  authMiddleware,
  roleMiddleware(["ADMIN", "TEAM_LEADER"]),
  async (req: Request, res: Response) => {
    try {
      const { startDate, endDate } = req.query;
      
      const dateRange = startDate && endDate ? {
        start: new Date(startDate as string),
        end: new Date(endDate as string)
      } : undefined;
      
      const analytics = await OrderAnalyticsService.getStartMethodAnalytics(dateRange);
      res.json({ success: true, data: analytics });
    } catch (error) {
      console.error("Start method analytics error:", error);
      res.status(500).json({ 
        success: false,
        message: "Failed to get start method analytics",
        error: String(error)
      });
    }
  }
);

router.get(
  "/analytics/completion",
  authMiddleware,
  roleMiddleware(["ADMIN", "TEAM_LEADER"]),
  async (req: Request, res: Response) => {
    try {
      const { startDate, endDate } = req.query;
      
      const dateRange = startDate && endDate ? {
        start: new Date(startDate as string),
        end: new Date(endDate as string)
      } : undefined;
      
      const analytics = await OrderAnalyticsService.getCompletionAnalytics(dateRange);
      res.json({ success: true, data: analytics });
    } catch (error) {
      console.error("Completion analytics error:", error);
      res.status(500).json({ 
        success: false,
        message: "Failed to get completion analytics",
        error: String(error)
      });
    }
  }
);

export default router;
