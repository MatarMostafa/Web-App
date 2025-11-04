import { Request, Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import * as orderNotesService from "../services/orderNotesService";

/**
 * GET /api/orders/:orderId/notes
 * Get all notes for a specific order
 */
export const getOrderNotes = async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  try {
    const { orderId } = req.params;
    const userId = authReq.user?.id as string;
    const userRole = authReq.user?.role as string;

    if (!orderId) {
      return res.status(400).json({ message: "Order ID is required" });
    }

    const notes = await orderNotesService.getOrderNotesService(orderId, userRole);

    // Transform response to include author name
    const transformedNotes = notes.map((note) => ({
      ...note,
      authorName: note.author.employee
        ? `${note.author.employee.firstName} ${note.author.employee.lastName}`
        : note.author.username,
    }));

    res.json({
      success: true,
      data: transformedNotes,
    });
  } catch (error) {
    console.error("getOrderNotes error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching order notes",
      error: String(error),
    });
  }
};

/**
 * POST /api/orders/:orderId/notes
 * Create a new note for an order
 */
export const createOrderNote = async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  try {
    const { orderId } = req.params;
    const authorId = authReq.user?.id as string;
    const { content, triggersStatus, category, isInternal } = req.body;

    if (!orderId) {
      return res.status(400).json({ message: "Order ID is required" });
    }

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ message: "Note content is required" });
    }

    const note = await orderNotesService.createOrderNoteService({
      orderId,
      authorId,
      content: content.trim(),
      triggersStatus,
      category,
      isInternal,
    });

    // Transform response to include author name
    const transformedNote = {
      ...note,
      authorName: note.author.employee
        ? `${note.author.employee.firstName} ${note.author.employee.lastName}`
        : note.author.username,
    };

    res.status(201).json({
      success: true,
      data: transformedNote,
      message: "Note created successfully",
    });
  } catch (error) {
    console.error("createOrderNote error:", error);
    
    if (error instanceof Error) {
      if (error.message.includes("not found") || error.message.includes("not authorized")) {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
    }

    res.status(500).json({
      success: false,
      message: "Error creating order note",
      error: String(error),
    });
  }
};

/**
 * GET /api/orders/:orderId/notes/:noteId
 * Get a specific note by ID
 */
export const getOrderNoteById = async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  try {
    const { noteId } = req.params;
    const userId = authReq.user?.id as string;
    const userRole = authReq.user?.role as string;

    if (!noteId) {
      return res.status(400).json({ message: "Note ID is required" });
    }

    const note = await orderNotesService.getOrderNoteByIdService(noteId, userId, userRole);

    // Transform response to include author name
    const transformedNote = {
      ...note,
      authorName: note.author.employee
        ? `${note.author.employee.firstName} ${note.author.employee.lastName}`
        : note.author.username,
    };

    res.json({
      success: true,
      data: transformedNote,
    });
  } catch (error) {
    console.error("getOrderNoteById error:", error);
    
    if (error instanceof Error && error.message.includes("not found")) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: "Error fetching order note",
      error: String(error),
    });
  }
};

/**
 * PUT /api/orders/:orderId/notes/:noteId
 * Update a note (author only)
 */
export const updateOrderNote = async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  try {
    const { noteId } = req.params;
    const authorId = authReq.user?.id as string;
    const { content, category, isInternal } = req.body;

    if (!noteId) {
      return res.status(400).json({ message: "Note ID is required" });
    }

    const updateData: any = {};
    if (content !== undefined) updateData.content = content.trim();
    if (category !== undefined) updateData.category = category;
    if (isInternal !== undefined) updateData.isInternal = isInternal;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: "No valid fields to update" });
    }

    const note = await orderNotesService.updateOrderNoteService(noteId, authorId, updateData);

    // Transform response to include author name
    const transformedNote = {
      ...note,
      authorName: note.author.employee
        ? `${note.author.employee.firstName} ${note.author.employee.lastName}`
        : note.author.username,
    };

    res.json({
      success: true,
      data: transformedNote,
      message: "Note updated successfully",
    });
  } catch (error) {
    console.error("updateOrderNote error:", error);
    
    if (error instanceof Error && error.message.includes("not found")) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: "Error updating order note",
      error: String(error),
    });
  }
};

/**
 * DELETE /api/orders/:orderId/notes/:noteId
 * Delete a note (author or admin only)
 */
export const deleteOrderNote = async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  try {
    const { noteId } = req.params;
    const authorId = authReq.user?.id as string;
    const userRole = authReq.user?.role as string;

    if (!noteId) {
      return res.status(400).json({ message: "Note ID is required" });
    }

    await orderNotesService.deleteOrderNoteService(noteId, authorId, userRole);

    res.json({
      success: true,
      message: "Note deleted successfully",
    });
  } catch (error) {
    console.error("deleteOrderNote error:", error);
    
    if (error instanceof Error && error.message.includes("not found")) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: "Error deleting order note",
      error: String(error),
    });
  }
};

/**
 * GET /api/orders/:orderId/notes/count
 * Get count of notes for an order
 */
export const getOrderNotesCount = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;

    if (!orderId) {
      return res.status(400).json({ message: "Order ID is required" });
    }

    const count = await orderNotesService.getOrderNotesCountService(orderId);

    res.json({
      success: true,
      data: { count },
    });
  } catch (error) {
    console.error("getOrderNotesCount error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching notes count",
      error: String(error),
    });
  }
};