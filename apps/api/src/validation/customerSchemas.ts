// src/validation/customerSchemas.ts
import { z } from "zod";

// Create
export const createCustomerSchema = z.object({
  body: z.object({
    companyName: z.string().min(1, "Company name is required"),
    contactEmail: z.string().email().optional(),
    contactPhone: z.string().max(20).optional(),
    address: z.record(z.string(), z.any()).optional(),
    industry: z.string().optional(),
    taxNumber: z.string().optional(),
    isActive: z.boolean().optional().default(true),
  }),
});

// Update
export const updateCustomerSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Customer ID is required"),
  }),
  body: z.object({
    companyName: z.string().optional(),
    contactEmail: z.string().email().optional(),
    contactPhone: z.string().max(20).optional(),
    address: z.record(z.string(), z.any()).optional(),
    industry: z.string().optional(),
    taxNumber: z.string().optional(),
    isActive: z.boolean().optional(),
  }),
});

// Delete
export const deleteCustomerSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Customer ID is required"),
  }),
});

// Subaccount
export const addSubaccountSchema = z.object({
  body: z.object({
    customerId: z.string().min(1, "Customer ID is required"),
    name: z.string().min(1, "Subaccount name is required"),
    code: z.string().optional(),
    isActive: z.boolean().optional().default(true),
  }),
});

/*Subaccounts*/
// Create
export const createSubAccountSchema = z.object({
  params: z.object({
    customerId: z.string().min(1, "Customer ID is required"),
  }),
  body: z.object({
    name: z.string().min(1, "Subaccount name is required"),
    code: z.string().optional(),
    isActive: z.boolean().optional().default(true),
  }),
});

// Update
export const updateSubAccountSchema = z.object({
  params: z.object({
    customerId: z.string().min(1, "Customer ID is required"),
    id: z.string().min(1, "Subaccount ID is required"),
  }),
  body: z.object({
    name: z.string().optional(),
    code: z.string().optional(),
    isActive: z.boolean().optional(),
  }),
});

// Delete
export const deleteSubAccountSchema = z.object({
  params: z.object({
    customerId: z.string().min(1, "Customer ID is required"),
    id: z.string().min(1, "Subaccount ID is required"),
  }),
});