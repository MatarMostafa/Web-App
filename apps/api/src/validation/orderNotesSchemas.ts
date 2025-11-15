import { z } from "zod";

// Enum schemas matching Prisma enums
export const OrderStatusSchema = z.enum([
  "DRAFT",
  "OPEN", 
  "ACTIVE",
  "IN_PROGRESS",
  "IN_REVIEW",
  "COMPLETED",
  "CANCELLED",
  "EXPIRED"
]);

export const NoteCategorySchema = z.enum([
  "COMPLETION_REQUEST",
  "ADMIN_RESPONSE", 
  "GENERAL_UPDATE",
  "ISSUE_REPORT"
]);

// Create order note schema
export const createOrderNoteSchema = z.object({
  content: z
    .string()
    .min(1, "Content is required")
    .max(2000, "Content must be less than 2000 characters")
    .trim(),
  triggersStatus: OrderStatusSchema.optional(),
  category: NoteCategorySchema.optional().default("GENERAL_UPDATE"),
  isInternal: z.boolean().optional().default(false),
});

// Update order note schema
export const updateOrderNoteSchema = z.object({
  content: z
    .string()
    .min(1, "Content is required")
    .max(2000, "Content must be less than 2000 characters")
    .trim()
    .optional(),
  category: NoteCategorySchema.optional(),
  isInternal: z.boolean().optional(),
});

// Order ID param schema
export const orderIdParamSchema = z.object({
  orderId: z.string().cuid("Invalid order ID format"),
});

// Note ID param schema  
export const noteIdParamSchema = z.object({
  noteId: z.string().cuid("Invalid note ID format"),
});

// Combined schemas for route validation
export const createOrderNoteRequestSchema = z.object({
  params: orderIdParamSchema,
  body: createOrderNoteSchema,
});

export const updateOrderNoteRequestSchema = z.object({
  params: orderIdParamSchema.merge(noteIdParamSchema),
  body: updateOrderNoteSchema,
});

export const getOrderNotesRequestSchema = z.object({
  params: orderIdParamSchema,
});

export const getOrderNoteByIdRequestSchema = z.object({
  params: orderIdParamSchema.merge(noteIdParamSchema),
});

export const deleteOrderNoteRequestSchema = z.object({
  params: orderIdParamSchema.merge(noteIdParamSchema),
});

export const getOrderNotesCountRequestSchema = z.object({
  params: orderIdParamSchema,
});

// Type exports for TypeScript
export type CreateOrderNoteRequest = z.infer<typeof createOrderNoteRequestSchema>;
export type UpdateOrderNoteRequest = z.infer<typeof updateOrderNoteRequestSchema>;
export type GetOrderNotesRequest = z.infer<typeof getOrderNotesRequestSchema>;
export type GetOrderNoteByIdRequest = z.infer<typeof getOrderNoteByIdRequestSchema>;
export type DeleteOrderNoteRequest = z.infer<typeof deleteOrderNoteRequestSchema>;
export type GetOrderNotesCountRequest = z.infer<typeof getOrderNotesCountRequestSchema>;