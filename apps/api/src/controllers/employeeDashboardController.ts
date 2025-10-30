import { Request, Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import * as employeeDashboardService from "../services/employeeDashboardService";
import { manualArchiveTrigger } from "../services/weeklyArchiveService";

export const getCurrentWeekOrders = async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  try {
    const userId = authReq.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const orders = await employeeDashboardService.getCurrentWeekOrders(userId);
    res.json(orders);
  } catch (error) {
    console.error("Get current week orders error:", error);
    res.status(500).json({ 
      message: "Failed to fetch current week orders", 
      error: error instanceof Error ? error.message : String(error)
    });
  }
};

export const getArchivedOrders = async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  try {
    const userId = authReq.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const orders = await employeeDashboardService.getArchivedOrders(userId);
    res.json(orders);
  } catch (error) {
    console.error("Get archived orders error:", error);
    res.status(500).json({ 
      message: "Failed to fetch archived orders", 
      error: error instanceof Error ? error.message : String(error)
    });
  }
};

export const getDashboardStats = async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  try {
    const userId = authReq.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const stats = await employeeDashboardService.getDashboardStats(userId);
    res.json(stats);
  } catch (error) {
    console.error("Get dashboard stats error:", error);
    res.status(500).json({ 
      message: "Failed to fetch dashboard stats", 
      error: error instanceof Error ? error.message : String(error)
    });
  }
};

export const updateOrderStatus = async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  try {
    const userId = authReq.user?.id;
    const { orderId } = req.params;
    const { status } = req.body;

    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }

    const updatedOrder = await employeeDashboardService.updateOrderStatus(userId, orderId, status);
    
    if (!updatedOrder) {
      return res.status(404).json({ message: "Order not found or not assigned to you" });
    }

    res.json(updatedOrder);
  } catch (error) {
    console.error("Update order status error:", error);
    res.status(500).json({ 
      message: "Failed to update order status", 
      error: error instanceof Error ? error.message : String(error)
    });
  }
};

export const triggerWeeklyArchive = async (req: Request, res: Response) => {
  try {
    const result = await manualArchiveTrigger();
    res.json({
      message: "Weekly archive process completed successfully",
      ...result,
    });
  } catch (error) {
    console.error("Weekly archive trigger error:", error);
    res.status(500).json({ 
      message: "Failed to trigger weekly archive", 
      error: error instanceof Error ? error.message : String(error)
    });
  }
};