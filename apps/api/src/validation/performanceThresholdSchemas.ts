import { z } from "zod";

// Utility: integer between 0-100
const scoreField = z.number().int().min(0, { message: "Must be >= 0" }).max(100, { message: "Must be <= 100" });

// Shared threshold body with comprehensive validations
const thresholdBody = z
  .object({
    redMin: scoreField,
    redMax: scoreField,
    yellowMin: scoreField,
    yellowMax: scoreField,
    greenMin: scoreField,
    greenMax: scoreField,
  })
  .refine((d) => d.redMin <= d.redMax, {
    message: "Red range is invalid (min > max)",
    path: ["redMax"],
  })
  .refine((d) => d.yellowMin <= d.yellowMax, {
    message: "Yellow range is invalid (min > max)",
    path: ["yellowMax"],
  })
  .refine((d) => d.greenMin <= d.greenMax, {
    message: "Green range is invalid (min > max)",
    path: ["greenMax"],
  })
  .refine((d) => d.redMin === 0, {
    message: "Red range must start at 0",
    path: ["redMin"],
  })
  .refine((d) => d.greenMax === 100, {
    message: "Green range must end at 100",
    path: ["greenMax"],
  })
  .refine((d) => d.redMax + 1 === d.yellowMin, {
    message: "No gaps allowed: Yellow must start immediately after Red ends",
    path: ["yellowMin"],
  })
  .refine((d) => d.yellowMax + 1 === d.greenMin, {
    message: "No gaps allowed: Green must start immediately after Yellow ends",
    path: ["greenMin"],
  });

// ✅ Create Performance Threshold
export const createPerformanceThresholdSchema = z.object({
  params: z.object({
    id: z.string().min(1, { message: "Department ID is required" }),
  }),
  body: thresholdBody,
});

// ✅ Update Performance Threshold (partial + consistent)
const partialThresholdBody = z
  .object({
    redMin: scoreField.optional(),
    redMax: scoreField.optional(),
    yellowMin: scoreField.optional(),
    yellowMax: scoreField.optional(),
    greenMin: scoreField.optional(),
    greenMax: scoreField.optional(),
  })
  .refine(
    (d) => {
      // Only validate if both values are present
      if (d.redMin !== undefined && d.redMax !== undefined && d.redMin > d.redMax) {
        return false;
      }
      if (d.yellowMin !== undefined && d.yellowMax !== undefined && d.yellowMin > d.yellowMax) {
        return false;
      }
      if (d.greenMin !== undefined && d.greenMax !== undefined && d.greenMin > d.greenMax) {
        return false;
      }
      return true;
    },
    { message: "One or more ranges are invalid (min > max)" }
  );

export const updatePerformanceThresholdSchema = z.object({
  params: z.object({
    id: z.string().min(1, { message: "Threshold ID is required" }),
  }),
  body: partialThresholdBody,
});

// ✅ Delete Performance Threshold
export const deletePerformanceThresholdSchema = z.object({
  params: z.object({
    id: z.string().min(1, { message: "Threshold ID is required" }),
  }),
});
