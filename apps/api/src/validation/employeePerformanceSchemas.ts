// src/validators/employeePerformanceSchemas.ts
import { z } from "zod";

// Utility: flexible date → Date object
const dateField = z.preprocess(
  (val) => (typeof val === "string" || val instanceof Date ? new Date(val) : val),
  z.date().refine((d) => !isNaN(d.getTime()), { message: "Invalid date" })
);

// Utility: decimal score (number or string)
const scoreField = z.preprocess(
  (val) => (typeof val === "string" ? parseFloat(val) : val),
  z.number().min(0).max(100)
);

// Create Employee Performance
export const createEmployeePerformanceSchema = z.object({
  body: z
    .object({
      employeeId: z.string().min(1, "Employee ID is required"),
      periodStart: dateField,
      periodEnd: dateField,
      metrics: z.record(z.string(), z.any()).optional(),
      manualOverride: z.boolean().optional(),
      manualOverrideById: z.string().optional(),
      score: scoreField.optional(),
      trafficLight: z.enum(["RED", "YELLOW", "GREEN"]).optional(),
      trafficLightReason: z.string().optional(),
    })
    .refine((data) => {
      if (data.manualOverride) {
        return data.score !== undefined && data.trafficLight !== undefined;
      } else {
        return data.metrics && Object.keys(data.metrics).length > 0;
      }
    }, { 
      message: "Manual override requires score and trafficLight. Automatic mode requires metrics."
    }),
});

// Update Employee Performance
export const updateEmployeePerformanceSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Performance record ID is required"),
  }),
  body: z
    .object({
      periodStart: dateField.optional(),
      periodEnd: dateField.optional(),
      metrics: z.record(z.string(), z.any()).optional(),
      manualOverride: z.boolean().optional(),
      manualOverrideById: z.string().optional(),
      score: scoreField.optional(),
      trafficLight: z.enum(["RED", "YELLOW", "GREEN"]).optional(),
      trafficLightReason: z.string().optional(),
    })
    .refine((data) => {
      if (data.manualOverride) {
        return data.score !== undefined && data.trafficLight !== undefined;
      }
      return true;
    }, { message: "Manual override requires score and trafficLight" }),
});

// Delete Employee Performance
export const deleteEmployeePerformanceSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Performance record ID is required"),
  }),
});
