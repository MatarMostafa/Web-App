// src/validation/employeeStatusSchemas.ts
import { z } from "zod";

export const blockSchema = z.object({
  body: z.object({
    userId: z.string().min(1), // user.id (not employee id)
    reason: z.string().max(1000).optional(),
  }),
});

export const unblockSchema = z.object({
  body: z.object({
    userId: z.string().min(1),
    reason: z.string().max(1000).optional(),
  }),
});

export const leaveSchema = z.object({
  body: z.object({
    startDate: z
      .string()
      .or(z.instanceof(Date))
      .transform((v) => new Date(v)),
    endDate: z
      .string()
      .or(z.instanceof(Date))
      .transform((v) => new Date(v)),
    reason: z.string().max(2000).optional(),
  }),
});

export const sickSchema = z.object({
  body: z.object({
    startDate: z
      .string()
      .or(z.instanceof(Date))
      .transform((v) => new Date(v)),
    endDate: z
      .string()
      .or(z.instanceof(Date))
      .transform((v) => new Date(v)),
    reason: z.string().max(2000).optional(),
    documentUrls: z.array(z.string().url()).optional(),
  }),
});
