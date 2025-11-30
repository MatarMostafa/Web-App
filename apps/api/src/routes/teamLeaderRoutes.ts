import express from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import { roleMiddleware } from "../middleware/roleMiddleware";
import {
  getDashboard,
  getOrders,
  createOrder,
  updateOrder,
  getTeamMembers,
} from "../controllers/teamLeaderController";

const router = express.Router();

// Team Leader Dashboard
router.get(
  "/dashboard",
  authMiddleware,
  roleMiddleware(["TEAM_LEADER"]),
  getDashboard
);

// Team Leader Orders
router.get(
  "/orders",
  authMiddleware,
  roleMiddleware(["TEAM_LEADER"]),
  getOrders
);

// Create Order (without pricing)
router.post(
  "/orders",
  authMiddleware,
  roleMiddleware(["TEAM_LEADER"]),
  createOrder
);

// Update Order (without pricing)
router.put(
  "/orders/:id",
  authMiddleware,
  roleMiddleware(["TEAM_LEADER"]),
  updateOrder
);

// Get Team Members (secure endpoint)
router.get(
  "/employees",
  authMiddleware,
  roleMiddleware(["TEAM_LEADER"]),
  getTeamMembers
);

export default router;