import { Request, Response } from "express";
import * as templateService from "../services/templateService";
import { AuthRequest } from "../middleware/authMiddleware";

// Customer Template Controllers
export const createCustomerTemplate = async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  try {
    const { customerId } = req.params;
    const { templateLines } = req.body;

    if (!templateLines || !Array.isArray(templateLines)) {
      return res.status(400).json({
        success: false,
        message: "Template lines are required and must be an array"
      });
    }

    if (templateLines.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one template line is required"
      });
    }

    const template = await templateService.createCustomerTemplate({
      customerId,
      templateLines,
      createdBy: authReq.user?.id,
    });

    res.status(201).json({
      success: true,
      data: template,
    });
  } catch (error: any) {
    console.error("Create customer template error:", error);
    res.status(400).json({
      success: false,
      message: error.message || "Failed to create template",
    });
  }
};

export const getCustomerTemplate = async (req: Request, res: Response) => {
  try {
    const { customerId } = req.params;

    const template = await templateService.getCustomerTemplate(customerId);

    if (!template) {
      return res.status(404).json({
        success: false,
        message: "Template not found",
      });
    }

    res.json({
      success: true,
      data: template,
    });
  } catch (error: any) {
    console.error("Get customer template error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to get template",
    });
  }
};

export const updateCustomerTemplate = async (req: Request, res: Response) => {
  try {
    const { customerId } = req.params;
    const { templateLines } = req.body;

    if (!templateLines || !Array.isArray(templateLines)) {
      return res.status(400).json({
        success: false,
        message: "Template lines are required and must be an array"
      });
    }

    if (templateLines.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one template line is required"
      });
    }

    const template = await templateService.updateCustomerTemplate(customerId, {
      templateLines,
    });

    res.json({
      success: true,
      data: template,
    });
  } catch (error: any) {
    console.error("Update customer template error:", error);
    res.status(400).json({
      success: false,
      message: error.message || "Failed to update template",
    });
  }
};

export const deleteCustomerTemplate = async (req: Request, res: Response) => {
  try {
    const { customerId } = req.params;

    await templateService.deleteCustomerTemplate(customerId);

    res.json({
      success: true,
      message: "Template deleted successfully",
    });
  } catch (error: any) {
    console.error("Delete customer template error:", error);
    res.status(400).json({
      success: false,
      message: error.message || "Failed to delete template",
    });
  }
};

// Order Description Data Controllers
export const createOrderDescriptionData = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const { descriptionData } = req.body;

    if (!descriptionData || typeof descriptionData !== "object") {
      return res.status(400).json({
        success: false,
        message: "Description data is required and must be an object"
      });
    }

    const orderData = await templateService.createOrderDescriptionData({
      orderId,
      descriptionData,
    });

    res.status(201).json({
      success: true,
      data: orderData,
    });
  } catch (error: any) {
    console.error("Create order description data error:", error);
    res.status(400).json({
      success: false,
      message: error.message || "Failed to create description data",
    });
  }
};

export const getOrderDescriptionData = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;

    const orderData = await templateService.getOrderDescriptionData(orderId);

    if (!orderData) {
      return res.status(404).json({
        success: false,
        message: "Description data not found",
      });
    }

    res.json({
      success: true,
      data: orderData,
    });
  } catch (error: any) {
    console.error("Get order description data error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to get description data",
    });
  }
};

export const updateOrderDescriptionData = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const { descriptionData } = req.body;

    if (!descriptionData || typeof descriptionData !== "object") {
      return res.status(400).json({
        success: false,
        message: "Description data is required and must be an object"
      });
    }

    const orderData = await templateService.updateOrderDescriptionData(orderId, {
      descriptionData,
    });

    res.json({
      success: true,
      data: orderData,
    });
  } catch (error: any) {
    console.error("Update order description data error:", error);
    res.status(400).json({
      success: false,
      message: error.message || "Failed to update description data",
    });
  }
};

export const getOrderWithTemplateData = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;

    const order = await templateService.getOrderWithTemplateData(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.json({
      success: true,
      data: order,
    });
  } catch (error: any) {
    console.error("Get order with template data error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to get order data",
    });
  }
};