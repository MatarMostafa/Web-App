import { z } from "zod";
import { DocumentType } from "../generated/prisma";

// File upload schema
export const uploadFileSchema = z.object({
  body: z.object({
    documentType: z.nativeEnum(DocumentType).optional(),
    description: z.string().max(500).optional(),
    expiryDate: z.string().optional(),
    employeeId: z.string().optional(),
    orderId: z.string().optional(), 
    assignmentId: z.string().optional(),
    isPublic: z.string().optional() // comes as string from form data
  }).optional()
});

// Update file schema
export const updateFileSchema = z.object({
  params: z.object({
    id: z.string()
  }),
  body: z.object({
    description: z.string().max(500).optional(),
    documentType: z.nativeEnum(DocumentType).optional(),
    expiryDate: z.string().optional(),
    isPublic: z.boolean().optional()
  })
});

// Delete file schema
export const deleteFileSchema = z.object({
  params: z.object({
    id: z.string()
  })
});

// Get file schema
export const getFileSchema = z.object({
  params: z.object({
    id: z.string()
  })
});

// Get employee files schema
export const getEmployeeFilesSchema = z.object({
  params: z.object({
    employeeId: z.string()
  })
});

// Get order files schema
export const getOrderFilesSchema = z.object({
  params: z.object({
    orderId: z.string()
  })
});

// Get assignment files schema
export const getAssignmentFilesSchema = z.object({
  params: z.object({
    assignmentId: z.string()
  })
});

// Get expiring files schema
export const getExpiringFilesSchema = z.object({
  query: z.object({
    days: z.string().optional()
  }).optional()
});

// Verify file schema
export const verifyFileSchema = z.object({
  params: z.object({
    id: z.string()
  })
});