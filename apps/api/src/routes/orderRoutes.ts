import express from "express";
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
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrder,
  deleteOrder,
  updateOrderStatus,
  getOrderSummary,
  getAssignments,
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
} from "../controllers/orderController";

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
  roleMiddleware(["ADMIN", "TEAM_LEADER"]),
  getAssignments
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

export default router;
