// src/controllers/notificationController.ts
import { Request, Response } from "express";
import * as notificationService from "../services/notificationServices";
import { AuthRequest } from "../middleware/authMiddleware";

/**
 * GET /api/notifications
 */
export const getNotifications = async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  try {
    const userId = authReq.user?.id as string;
    const page = Math.max(Number(req.query.page ?? 1), 1);
    const limit = Math.min(Number(req.query.limit ?? 20), 100);

    const data = await notificationService.getNotifications({
      userId,
      page,
      limit,
    });

    res.json(data);
  } catch (error) {
    console.error("getNotifications error:", error);
    res
      .status(500)
      .json({ message: "Error fetching notifications", error: String(error) });
  }
};

/**
 * GET /api/notifications/unread-count
 */
export const getUnreadCount = async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  try {
    const userId = authReq.user?.id as string;
    const count = await notificationService.getUnreadCount(userId);
    res.json({ unreadCount: count });
  } catch (error) {
    console.error("getUnreadCount error:", error);
    res
      .status(500)
      .json({ message: "Error fetching unread count", error: String(error) });
  }
};

/**
 * GET /api/notifications/:id
 */
export const getNotificationById = async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  try {
    const userId = authReq.user?.id as string;
    const id = req.params.id;
    const record = await notificationService.getNotificationById(id, userId);
    if (!record)
      return res.status(404).json({ message: "Notification not found" });
    res.json(record);
  } catch (error) {
    console.error("getNotificationById error:", error);
    res
      .status(500)
      .json({ message: "Error fetching notification", error: String(error) });
  }
};

/**
 * POST /api/notifications
 */
export const createNotification = async (req: Request, res: Response) => {
  try {
    const { userId: actorId } = req.body;
    const { templateKey, title, body, data, recipients } = req.body;

    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return res
        .status(400)
        .json({ message: "At least one recipient is required" });
    }

    const notif = await notificationService.createNotification({
      templateKey,
      title,
      body,
      data,
      recipients,
      createdBy: actorId,
    });

    res.status(201).json(notif);
  } catch (error) {
    console.error("createNotification error:", error);
    res
      .status(500)
      .json({ message: "Error creating notification", error: String(error) });
  }
};

/**
 * POST /api/notifications/:id/read
 */
export const markNotificationRead = async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  try {
    const userId = authReq.user?.id as string;
    const id = req.params.id;
    await notificationService.markAsRead(id, userId);
    res.sendStatus(204);
  } catch (error) {
    console.error("markNotificationRead error:", error);
    res
      .status(500)
      .json({ message: "Error marking as read", error: String(error) });
  }
};

/**
 * POST /api/notifications/:id/archive
 */
export const archiveNotification = async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  try {
    const userId = authReq.user?.id as string;
    const id = req.params.id;
    await notificationService.archiveNotification(id, userId);
    res.sendStatus(204);
  } catch (error) {
    console.error("archiveNotification error:", error);
    res
      .status(500)
      .json({ message: "Error archiving notification", error: String(error) });
  }
};

/**
 * GET /api/notifications/preferences
 */
export const getPreferences = async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  try {
    const userId = authReq.user?.id as string;
    const pref = await notificationService.getPreferences(userId);
    res.json(pref);
  } catch (error) {
    console.error("getPreferences error:", error);
    res
      .status(500)
      .json({ message: "Error fetching preferences", error: String(error) });
  }
};

/**
 * PUT /api/notifications/preferences
 */
export const updatePreferences = async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  try {
    const userId = authReq.user?.id as string;
    const payload = req.body;
    const pref = await notificationService.updatePreferences(userId, payload);
    res.json(pref);
  } catch (error) {
    console.error("updatePreferences error:", error);
    res
      .status(500)
      .json({ message: "Error updating preferences", error: String(error) });
  }
};

/**
 * PUT /api/notifications/:id/status
 */
export const updateNotificationStatus = async (req: Request, res: Response) => {
  try {
    const notificationId = req.params.id;
    const { status, deliveredAt } = req.body;

    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }

    const notification = await notificationService.updateNotificationStatus(
      notificationId,
      status,
      deliveredAt ? new Date(deliveredAt) : undefined
    );

    res.json(notification);
  } catch (error) {
    console.error("updateNotificationStatus error:", error);
    res.status(500).json({
      message: "Error updating notification status",
      error: String(error),
    });
  }
};

/**
 * PUT /api/notifications/recipients/:id/status
 */
export const updateRecipientStatus = async (req: Request, res: Response) => {
  try {
    const recipientId = req.params.id;
    const { status, error: errorMsg } = req.body;

    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }

    const recipient = await notificationService.updateRecipientStatus(
      recipientId,
      status,
      errorMsg
    );

    res.json(recipient);
  } catch (error) {
    console.error("updateRecipientStatus error:", error);
    res.status(500).json({
      message: "Error updating recipient status",
      error: String(error),
    });
  }
};
