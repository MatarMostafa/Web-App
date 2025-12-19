import { Request, Response } from "express";
import * as orderService from "../services/orderService";

// -------------------- Orders --------------------
export const getAllOrders = async (_req: Request, res: Response) => {
  const orders = await orderService.getAllOrdersService();
  res.json(orders);
};

export const getOrderById = async (req: Request, res: Response) => {
  const order = await orderService.getOrderByIdService(req.params.id);
  if (!order) return res.status(404).json({ message: "Auftrag nicht gefunden" });
  res.json(order);
};

export const createOrder = async (req: Request, res: Response) => {
  try {
    const order = await orderService.createOrderService(req.body, (req as any).user?.id);
    res.status(201).json(order);
  } catch (error) {
    console.error("Create order error:", error);
    console.error("Request body:", req.body);
    res.status(400).json({ 
      message: "Fehler beim Erstellen des Auftrags", 
      error: error instanceof Error ? error.message : String(error)
    });
  }
};

export const updateOrder = async (req: Request, res: Response) => {
  try {
    const order = await orderService.updateOrderService(req.params.id, req.body, (req as any).user?.id);
    res.json(order);
  } catch (error) {
    console.error("Update order error:", error);
    res.status(400).json({ 
      message: "Fehler beim Aktualisieren des Auftrags", 
      error: error instanceof Error ? error.message : String(error)
    });
  }
};

export const deleteOrder = async (req: Request, res: Response) => {
  try {
    await orderService.deleteOrderService(req.params.id);
    res.status(204).send();
  } catch (error) {
    console.error("Delete order error:", error);
    res.status(400).json({ 
      message: "Fehler beim Löschen des Auftrags", 
      error: error instanceof Error ? error.message : String(error)
    });
  }
};

export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const order = await orderService.updateOrderStatusService(
      req.params.id,
      req.body.status,
      (req as any).user?.id
    );
    res.json(order);
  } catch (error) {
    console.error("Update order status error:", error);
    res.status(400).json({ 
      message: "Fehler beim Aktualisieren des Auftragsstatus", 
      error: error instanceof Error ? error.message : String(error)
    });
  }
};

export const getOrderSummary = async (req: Request, res: Response) => {
  const summary = await orderService.getOrderSummaryService(req.params.id);
  if (!summary) return res.status(404).json({ message: "Auftrag nicht gefunden" });
  res.json(summary);
};

// -------------------- Assignments --------------------
export const getAssignments = async (req: Request, res: Response) => {
  try {
    const assignments = await orderService.getAssignmentsService(req.params.orderId);
    res.json({ success: true, data: assignments });
  } catch (error) {
    console.error("Get assignments error:", error);
    res.status(500).json({ 
      success: false,
      message: "Fehler beim Abrufen der Zuweisungen", 
      error: error instanceof Error ? error.message : String(error)
    });
  }
};

export const getAssignedEmployeeIds = async (req: Request, res: Response) => {
  try {
    const assignments = await orderService.getAssignmentsService(req.params.orderId);
    const employeeIds = assignments.map(assignment => assignment.employeeId);
    res.json(employeeIds);
  } catch (error) {
    console.error("Get assigned employee IDs error:", error);
    res.status(500).json({ 
      message: "Fehler beim Abrufen der zugewiesenen Mitarbeiter-IDs", 
      error: error instanceof Error ? error.message : String(error)
    });
  }
};

export const createAssignment = async (req: Request, res: Response) => {
  try {
    const assignment = await orderService.createAssignmentService(
      req.params.orderId,
      req.body,
      (req as any).user?.id
    );
    res.status(201).json(assignment);
  } catch (error) {
    console.error("Create assignment error:", error);
    res.status(400).json({ 
      message: "Fehler beim Erstellen der Zuweisung", 
      error: error instanceof Error ? error.message : String(error)
    });
  }
};

export const updateAssignment = async (req: Request, res: Response) => {
  try {
    const assignment = await orderService.updateAssignmentService(
      req.params.id,
      req.body,
      (req as any).user?.id
    );
    res.json(assignment);
  } catch (error) {
    console.error("Update assignment error:", error);
    res.status(400).json({ 
      message: "Fehler beim Aktualisieren der Zuweisung", 
      error: error instanceof Error ? error.message : String(error)
    });
  }
};

export const deleteAssignment = async (req: Request, res: Response) => {
  try {
    await orderService.deleteAssignmentService(req.params.id, (req as any).user?.id);
    res.json({ success: true, message: "Zuweisung erfolgreich gelöscht" });
  } catch (error) {
    console.error("Delete assignment error:", error);
    res.status(400).json({ 
      success: false,
      message: "Fehler beim Löschen der Zuweisung", 
      error: error instanceof Error ? error.message : String(error)
    });
  }
};

export const updateAssignmentStatus = async (req: Request, res: Response) => {
  try {
    const assignment = await orderService.updateAssignmentStatusService(
      req.params.id,
      req.body.status
    );
    res.json(assignment);
  } catch (error) {
    console.error("Update assignment status error:", error);
    res.status(400).json({ 
      message: "Fehler beim Aktualisieren des Zuweisungsstatus", 
      error: error instanceof Error ? error.message : String(error)
    });
  }
};

export const autoAssignEmployees = async (req: Request, res: Response) => {
  try {
    const result = await orderService.autoAssignEmployeesService(
      req.params.orderId,
      req.body
    );
    res.json(result);
  } catch (error) {
    console.error("Auto-assignment error:", error);
    res.status(400).json({ 
      message: "Automatische Zuweisung fehlgeschlagen", 
      error: error instanceof Error ? error.message : String(error)
    });
  }
};

// -------------------- OrderAssignments --------------------
export const getOrderAssignments = async (req: Request, res: Response) => {
  const orderAssignments = await orderService.getOrderAssignmentsService(
    req.params.orderId
  );
  res.json(orderAssignments);
};

export const createOrderAssignment = async (req: Request, res: Response) => {
  try {
    const orderAssignment = await orderService.createOrderAssignmentService(
      req.params.orderId,
      req.body
    );
    res.status(201).json(orderAssignment);
  } catch (error) {
    console.error("Create order assignment error:", error);
    res.status(400).json({ 
      message: "Fehler beim Erstellen der Auftragszuweisung", 
      error: error instanceof Error ? error.message : String(error)
    });
  }
};

export const deleteOrderAssignment = async (req: Request, res: Response) => {
  try {
    await orderService.deleteOrderAssignmentService(req.params.id);
    res.status(204).send();
  } catch (error) {
    console.error("Delete order assignment error:", error);
    res.status(400).json({ 
      message: "Fehler beim Löschen der Auftragszuweisung", 
      error: error instanceof Error ? error.message : String(error)
    });
  }
};

// -------------------- OrderQualifications --------------------
export const getOrderQualifications = async (req: Request, res: Response) => {
  const qualifications = await orderService.getOrderQualificationsService(
    req.params.orderId
  );
  res.json(qualifications);
};

export const createOrderQualification = async (req: Request, res: Response) => {
  try {
    const qualification = await orderService.createOrderQualificationService(
      req.params.orderId,
      req.body
    );
    res.status(201).json(qualification);
  } catch (error) {
    console.error("Create order qualification error:", error);
    res.status(400).json({ 
      message: "Fehler beim Erstellen der Auftragsqualifikation", 
      error: error instanceof Error ? error.message : String(error)
    });
  }
};

export const deleteOrderQualification = async (req: Request, res: Response) => {
  try {
    await orderService.deleteOrderQualificationService(req.params.id);
    res.status(204).send();
  } catch (error) {
    console.error("Delete order qualification error:", error);
    res.status(400).json({ 
      message: "Fehler beim Löschen der Auftragsqualifikation", 
      error: error instanceof Error ? error.message : String(error)
    });
  }
};


// -------------------- Ratings --------------------
export const getOrderRatings = async (req: Request, res: Response) => {
  const { orderId } = req.params;
  const { employeeId, customerId, status } = req.query;

  const filters: any = {};
  if (employeeId) filters.employeeId = String(employeeId);
  if (customerId) filters.customerId = String(customerId);
  if (status) filters.status = String(status);

  const ratings = await orderService.getOrderRatingsService(orderId, filters);
  res.json(ratings);
};

export const createOrderRating = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const rating = await orderService.createOrderRatingService(orderId, req.body);
    res.status(201).json(rating);
  } catch (error) {
    console.error("Create order rating error:", error);
    res.status(400).json({ 
      message: "Fehler beim Erstellen der Auftragsbewertung", 
      error: error instanceof Error ? error.message : String(error)
    });
  }
};

export const updateOrderRating = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const rating = await orderService.updateOrderRatingService(id, req.body);
    res.json(rating);
  } catch (error) {
    console.error("Update order rating error:", error);
    res.status(400).json({ 
      message: "Fehler beim Aktualisieren der Auftragsbewertung", 
      error: error instanceof Error ? error.message : String(error)
    });
  }
};

export const deleteOrderRating = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await orderService.deleteOrderRatingService(id);
    res.status(204).send();
  } catch (error) {
    console.error("Delete order rating error:", error);
    res.status(400).json({ 
      message: "Fehler beim Löschen der Auftragsbewertung", 
      error: error instanceof Error ? error.message : String(error)
    });
  }
};

// -------------------- Order Activities --------------------
export const getOrderActivities = async (req: Request, res: Response) => {
  try {
    const activities = await orderService.getOrderActivitiesService(req.params.orderId);
    res.json({ success: true, data: activities });
  } catch (error) {
    console.error("Get order activities error:", error);
    res.status(500).json({ 
      success: false,
      message: "Fehler beim Abrufen der Auftragsaktivitäten", 
      error: error instanceof Error ? error.message : String(error)
    });
  }
};
