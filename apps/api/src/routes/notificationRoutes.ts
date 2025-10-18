// src/routes/notificationRoutes.ts
import express from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import { roleMiddleware } from "../middleware/roleMiddleware";
import {
  getNotifications,
  getNotificationById,
  createNotification,
  markNotificationRead,
  archiveNotification,
  getUnreadCount,
  getPreferences,
  updatePreferences,
  updateNotificationStatus,
  updateRecipientStatus,
} from "../controllers/notificationController";

const router = express.Router();

/**
 * @route GET /api/notifications
 * @desc Get notifications for current user (paginated)
 * @access Authenticated users
 */
router.get("/", authMiddleware, getNotifications);

/**
 * @route GET /api/notifications/unread-count
 * @desc Get unread notification count for current user
 * @access Authenticated users
 */
router.get("/unread-count", authMiddleware, getUnreadCount);

/**
 * @route GET /api/notifications/:id
 * @desc Get single notification by recipient id (ensures current user is owner)
 * @access Authenticated users
 */
router.get("/:id", authMiddleware, getNotificationById);

/**
 * @route POST /api/notifications
 * @desc Create a notification (system usage)
 * @access ADMIN, TEAM_LEADER, HR_MANAGER, SUPER_ADMIN
 *
 * Body example:
 * {
 *   "templateKey": "ASSIGNMENT_CREATED",
 *   "title": "You were assigned",
 *   "body": "You have a new assignment for order #123",
 *   "data": { "assignmentId": "..." },
 *   "recipients": [
 *     { "userId": "userId1", "channels": ["in_app","email"] },
 *     { "userId": "userId2" }
 *   ]
 * }
 */
router.post(
  "/",
  authMiddleware,
  roleMiddleware(["ADMIN", "TEAM_LEADER", "HR_MANAGER", "SUPER_ADMIN"]),
  createNotification
);

/**
 * @route POST /api/notifications/:id/read
 * @desc Mark a single notification (by recipient row id) as read
 * @access Authenticated users (owner)
 */
router.post("/:id/read", authMiddleware, markNotificationRead);

/**
 * @route POST /api/notifications/:id/archive
 * @desc Archive a notification for the current user
 * @access Authenticated users (owner)
 */
router.post("/:id/archive", authMiddleware, archiveNotification);

/**
 * @route GET /api/notifications/preferences
 * @desc Get current user's notification preferences
 * @access Authenticated users
 */
router.get("/preferences", authMiddleware, getPreferences);

/**
 * @route PUT /api/notifications/preferences
 * @desc Update current user's notification preferences
 * @access Authenticated users
 *
 * Body example:
 * { "channels": ["in_app","email"], "quietHoursStart": 1320, "quietHoursEnd": 420, "digestEnabled": false }
 */
router.put("/preferences", authMiddleware, updatePreferences);

/**
 * @route PUT /api/notifications/:id/status
 * @desc Update notification status (PENDING, SENT, FAILED)
 * @access ADMIN, TEAM_LEADER, HR_MANAGER, SUPER_ADMIN
 *
 * Body example:
 * { "status": "SENT", "deliveredAt": "2025-01-01T12:00:00Z" }
 */
router.put(
  "/:id/status",
  authMiddleware,
  roleMiddleware(["ADMIN", "TEAM_LEADER", "HR_MANAGER", "SUPER_ADMIN"]),
  updateNotificationStatus
);

/**
 * @route PUT /api/notifications/recipients/:id/status
 * @desc Update recipient status (PENDING, SENT, FAILED)
 * @access ADMIN, TEAM_LEADER, HR_MANAGER, SUPER_ADMIN
 *
 * Body example:
 * { "status": "FAILED", "error": "Email delivery failed" }
 */
router.put(
  "/recipients/:id/status",
  authMiddleware,
  roleMiddleware(["ADMIN", "TEAM_LEADER", "HR_MANAGER", "SUPER_ADMIN"]),
  updateRecipientStatus
);

export default router;
