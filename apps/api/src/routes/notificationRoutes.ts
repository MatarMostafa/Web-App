// src/routes/notificationRoutes.ts
import express from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import { roleMiddleware } from "../middleware/roleMiddleware";
import {
  getNotifications,
  getNotificationById,
  createNotification,
  markNotificationRead,
  markAllNotificationsRead,
  archiveNotification,
  getUnreadCount,
  getPreferences,
  updatePreferences,
  updateNotificationStatus,
  updateRecipientStatus,
} from "../controllers/notificationController";

const router = express.Router();

router.get("/", authMiddleware, getNotifications);
router.get("/unread-count", authMiddleware, getUnreadCount);
router.get("/preferences", authMiddleware, getPreferences);
router.get("/:id", authMiddleware, getNotificationById);
router.post("/", authMiddleware, roleMiddleware(["ADMIN", "TEAM_LEADER", "HR_MANAGER", "SUPER_ADMIN"]), createNotification);
router.post("/mark-all-read", authMiddleware, markAllNotificationsRead);
router.post("/:id/read", authMiddleware, markNotificationRead);
router.post("/:id/archive", authMiddleware, archiveNotification);
router.put("/preferences", authMiddleware, updatePreferences);
router.put("/:id/status", authMiddleware, roleMiddleware(["ADMIN", "TEAM_LEADER", "HR_MANAGER", "SUPER_ADMIN"]), updateNotificationStatus);
router.put("/recipients/:id/status", authMiddleware, roleMiddleware(["ADMIN", "TEAM_LEADER", "HR_MANAGER", "SUPER_ADMIN"]), updateRecipientStatus);

export default router;