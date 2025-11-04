import { Request, Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import * as employeeDashboardService from "../services/employeeDashboardService";
import { manualArchiveTrigger } from "../services/weeklyArchiveService";

export const getCurrentWeekOrders = async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  try {
    const userId = authReq.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Benutzer nicht authentifiziert" });
    }

    const orders = await employeeDashboardService.getCurrentWeekOrders(userId);
    res.json(orders);
  } catch (error) {
    console.error("Get current week orders error:", error);
    res.status(500).json({ 
      message: "Fehler beim Abrufen der aktuellen Wochenaufträge", 
      error: error instanceof Error ? error.message : String(error)
    });
  }
};

export const getArchivedOrders = async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  try {
    const userId = authReq.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Benutzer nicht authentifiziert" });
    }

    const orders = await employeeDashboardService.getArchivedOrders(userId);
    res.json(orders);
  } catch (error) {
    console.error("Get archived orders error:", error);
    res.status(500).json({ 
      message: "Fehler beim Abrufen der archivierten Aufträge", 
      error: error instanceof Error ? error.message : String(error)
    });
  }
};

export const getDashboardStats = async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  try {
    const userId = authReq.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Benutzer nicht authentifiziert" });
    }

    const stats = await employeeDashboardService.getDashboardStats(userId);
    res.json(stats);
  } catch (error) {
    console.error("Get dashboard stats error:", error);
    res.status(500).json({ 
      message: "Fehler beim Abrufen der Dashboard-Statistiken", 
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
      return res.status(401).json({ message: "Benutzer nicht authentifiziert" });
    }

    if (!status) {
      return res.status(400).json({ message: "Status ist erforderlich" });
    }

    const updatedOrder = await employeeDashboardService.updateOrderStatus(userId, orderId, status);
    
    if (!updatedOrder) {
      return res.status(404).json({ message: "Auftrag nicht gefunden oder Ihnen nicht zugewiesen" });
    }

    res.json(updatedOrder);
  } catch (error) {
    console.error("Update order status error:", error);
    res.status(500).json({ 
      message: "Fehler beim Aktualisieren des Auftragsstatus", 
      error: error instanceof Error ? error.message : String(error)
    });
  }
};

export const triggerWeeklyArchive = async (req: Request, res: Response) => {
  try {
    const result = await manualArchiveTrigger();
    res.json({
      message: "Wöchentlicher Archivierungsprozess erfolgreich abgeschlossen",
      ...result,
    });
  } catch (error) {
    console.error("Weekly archive trigger error:", error);
    res.status(500).json({ 
      message: "Fehler beim Auslösen der wöchentlichen Archivierung", 
      error: error instanceof Error ? error.message : String(error)
    });
  }
};