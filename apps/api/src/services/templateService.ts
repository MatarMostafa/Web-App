import { prisma } from "@repo/db";
import {
  CreateCustomerTemplateData,
  UpdateCustomerTemplateData,
  CreateOrderDescriptionData,
  UpdateOrderDescriptionData,
} from "../types/template";

// Customer Template Services
export const createCustomerTemplate = async (data: CreateCustomerTemplateData) => {
  // Check if customer exists
  const customer = await prisma.customer.findUnique({
    where: { id: data.customerId }
  });

  if (!customer) {
    throw new Error("Customer not found");
  }

  // Check if template already exists
  const existingTemplate = await prisma.customerDescriptionTemplate.findUnique({
    where: { customerId: data.customerId }
  });

  if (existingTemplate) {
    throw new Error("Template already exists for this customer");
  }

  return prisma.customerDescriptionTemplate.create({
    data: {
      customerId: data.customerId,
      templateLines: data.templateLines,
      createdBy: data.createdBy,
    }
  });
};

export const getCustomerTemplate = async (customerId: string) => {
  return prisma.customerDescriptionTemplate.findUnique({
    where: { customerId }
  });
};

export const updateCustomerTemplate = async (customerId: string, data: UpdateCustomerTemplateData) => {
  const existingTemplate = await prisma.customerDescriptionTemplate.findUnique({
    where: { customerId }
  });

  if (!existingTemplate) {
    throw new Error("Template not found");
  }

  return prisma.customerDescriptionTemplate.update({
    where: { customerId },
    data: {
      templateLines: data.templateLines,
    }
  });
};

export const deleteCustomerTemplate = async (customerId: string) => {
  const existingTemplate = await prisma.customerDescriptionTemplate.findUnique({
    where: { customerId }
  });

  if (!existingTemplate) {
    throw new Error("Template not found");
  }

  return prisma.customerDescriptionTemplate.delete({
    where: { customerId }
  });
};

// Order Description Data Services
export const createOrderDescriptionData = async (data: CreateOrderDescriptionData) => {
  // Check if order exists
  const order = await prisma.order.findUnique({
    where: { id: data.orderId }
  });

  if (!order) {
    throw new Error("Order not found");
  }

  // Check if description data already exists
  const existingData = await prisma.orderDescriptionData.findUnique({
    where: { orderId: data.orderId }
  });

  if (existingData) {
    throw new Error("Description data already exists for this order");
  }

  // Update order to use template
  await prisma.order.update({
    where: { id: data.orderId },
    data: { usesTemplate: true }
  });

  return prisma.orderDescriptionData.create({
    data: {
      orderId: data.orderId,
      descriptionData: data.descriptionData,
    }
  });
};

export const getOrderDescriptionData = async (orderId: string) => {
  return prisma.orderDescriptionData.findUnique({
    where: { orderId }
  });
};

export const updateOrderDescriptionData = async (orderId: string, data: UpdateOrderDescriptionData) => {
  const existingData = await prisma.orderDescriptionData.findUnique({
    where: { orderId }
  });

  if (!existingData) {
    throw new Error("Description data not found");
  }

  return prisma.orderDescriptionData.update({
    where: { orderId },
    data: {
      descriptionData: data.descriptionData,
    }
  });
};

export const deleteOrderDescriptionData = async (orderId: string) => {
  const existingData = await prisma.orderDescriptionData.findUnique({
    where: { orderId }
  });

  if (!existingData) {
    throw new Error("Description data not found");
  }

  // Update order to not use template
  await prisma.order.update({
    where: { id: orderId },
    data: { usesTemplate: false }
  });

  return prisma.orderDescriptionData.delete({
    where: { orderId }
  });
};

// Helper function to get order with template data
export const getOrderWithTemplateData = async (orderId: string) => {
  return prisma.order.findUnique({
    where: { id: orderId },
    include: {
      customer: {
        include: {
          descriptionTemplate: true
        }
      },
      descriptionData: true
    }
  });
};