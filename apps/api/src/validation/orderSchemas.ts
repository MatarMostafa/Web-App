import { z } from "zod";
// Use string literals for enum validation since Prisma enums aren't directly exportable
const OrderStatus = {
  DRAFT: "DRAFT",
  OPEN: "OPEN", 
  ACTIVE: "ACTIVE",
  IN_PROGRESS: "IN_PROGRESS",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
  EXPIRED: "EXPIRED"
} as const;

const AssignmentStatus = {
  ASSIGNED: "ASSIGNED",
  ACTIVE: "ACTIVE",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
  OVERDUE: "OVERDUE"
} as const;

const RatingStatus = {
  EXCELLENT: "EXCELLENT",
  GOOD: "GOOD",
  NEEDS_IMPROVEMENT: "NEEDS_IMPROVEMENT"
} as const;

// =========================
// ENUMS (use Prisma generated enums)
// =========================
export const OrderStatusEnum = z.nativeEnum(OrderStatus);
export const AssignmentStatusEnum = z.nativeEnum(AssignmentStatus);
export const RatingStatusEnum = z.nativeEnum(RatingStatus);

// =========================
// DATE PREPROCESSOR
// =========================
const isoDateField = z.preprocess((val) => {
  if (typeof val === "string") {
    try {
      // Try to parse as date and convert to ISO
      const date = new Date(val);
      if (!isNaN(date.getTime())) {
        return date.toISOString();
      }
    } catch (e) {
      // If parsing fails, return original value for validation error
    }
  }
  return val;
}, z.string().datetime({ message: "Invalid datetime format" }));

// =========================
// ORDER SCHEMAS
// =========================
export const createOrderSchema = z.object({
  body: z.object({
    orderNumber: z.string().min(1).optional(),
    description: z.string().optional(),

    scheduledDate: isoDateField,
    startTime: isoDateField.optional(),
    endTime: isoDateField.optional(),
    duration: z.number().int().positive().nullable().optional(),
    location: z.string().optional(),

    requiredEmployees: z.number().int().positive().default(1),
    priority: z.number().int().min(1).default(1),
    specialInstructions: z.string().optional(),

    status: OrderStatusEnum.default("DRAFT"),
    customerId: z.string().cuid(),
    assignedEmployeeIds: z.array(z.string().cuid()).optional(),
    activities: z.array(z.object({
      activityId: z.string().cuid(),
      quantity: z.number().int().positive().optional().default(1)
    })).optional(),
    cartonQuantity: z.number().int().positive().optional(),
    articleQuantity: z.number().int().positive().optional(),
    templateData: z.record(z.string(), z.string()).nullable().optional(),
    containers: z.array(z.object({
      serialNumber: z.string().min(1),
      cartonQuantity: z.number().int().positive(),
      articleQuantity: z.number().int().positive(),
      cartonPrice: z.number().positive(),
      articlePrice: z.number().positive(),
      articles: z.array(z.object({
        articleName: z.string().min(1),
        quantity: z.number().int().positive(),
        price: z.number().positive()
      })).optional().default([])
    })).optional()
  })
});

export const updateOrderSchema = z.object({
  body: createOrderSchema.shape.body.partial().extend({
    cartonQuantity: z.number().int().positive().optional(),
    articleQuantity: z.number().int().positive().optional(),
    templateData: z.record(z.string(), z.string()).nullable().optional()
  }),
  params: z.object({ id: z.string().cuid() })
});

export const deleteOrderSchema = z.object({
  params: z.object({ id: z.string().cuid() })
});

export const updateOrderStatusSchema = z.object({
  params: z.object({ id: z.string().cuid() }),
  body: z.object({ status: OrderStatusEnum })
});

// =========================
// ASSIGNMENT SCHEMAS
// =========================
export const createAssignmentSchema = z.object({
  params: z.object({ orderId: z.string().cuid() }),
  body: z.object({
    employeeId: z.string().cuid(),
    startDate: z.string().datetime({ message: "Invalid datetime format" }).optional(),
    endDate: z.string().datetime({ message: "Invalid datetime format" }).optional(),
    estimatedHours: z.number().positive().optional(),
    notes: z.string().optional()
  })
});

export const updateAssignmentSchema = z.object({
  params: z.object({ id: z.string().cuid() }),
  body: z.object({
    startDate: z.string().datetime({ message: "Invalid datetime format" }).optional(),
    endDate: z.string().datetime({ message: "Invalid datetime format" }).optional(),
    status: AssignmentStatusEnum.optional(),
    estimatedHours: z.number().positive().optional(),
    actualHours: z.number().positive().optional(),
    notes: z.string().optional()
  })
});

export const deleteAssignmentSchema = z.object({
  params: z.object({ id: z.string().cuid() })
});

export const updateAssignmentStatusSchema = z.object({
  params: z.object({ id: z.string().cuid() }),
  body: z.object({ status: AssignmentStatusEnum })
});

// =========================
// ORDER ASSIGNMENTS (role + rate)
// =========================
export const createOrderAssignmentSchema = z.object({
  params: z.object({ orderId: z.string().cuid() }),
  body: z.object({
    employeeId: z.string().cuid(),
    role: z.string().optional(),
    hourlyRate: z.number().positive().optional()
  })
});

export const deleteOrderAssignmentSchema = z.object({
  params: z.object({ id: z.string().cuid() })
});

// =========================
// ORDER QUALIFICATIONS
// =========================
export const createOrderQualificationSchema = z.object({
  params: z.object({ orderId: z.string().cuid() }),
  body: z.object({
    qualificationId: z.string().cuid(),
    required: z.boolean().default(true),
    minProficiency: z.number().int().min(1).default(1)
  })
});

export const deleteOrderQualificationSchema = z.object({
  params: z.object({ id: z.string().cuid() })
});



// Create rating for an order
export const createOrderRatingSchema = z.object({
  params: z.object({ orderId: z.string().cuid() }),
  body: z.object({
    employeeId: z.string().cuid().optional(), // optional if rating by customer
    customerId: z.string().cuid().optional(), // optional if rating by employee
    rating: z.number().min(1).max(5),
    comment: z.string().max(500).optional(),
    category: z.string().max(100).optional(),
    status: RatingStatusEnum,
    ratedBy: z.string().optional() // userId who created the rating
  })
});

// Update rating
export const updateOrderRatingSchema = z.object({
  params: z.object({ id: z.string().cuid() }),
  body: z.object({
    rating: z.number().min(1).max(5).optional(),
    comment: z.string().max(500).optional(),
    category: z.string().max(100).optional(),
    status: RatingStatusEnum.optional()
  })
});

// Delete rating
export const deleteOrderRatingSchema = z.object({
  params: z.object({ id: z.string().cuid() })
});

// =========================
// AUTO ASSIGNMENT SCHEMA
// =========================
export const autoAssignEmployeesSchema = z.object({
  params: z.object({ orderId: z.string().cuid() }),
  body: z.object({
    maxEmployees: z.number().int().positive().max(20).optional(),
    requireAllQualifications: z.boolean().optional().default(true),
    minPerformanceScore: z.number().min(0).max(100).optional().default(0),
    excludeEmployeeIds: z.array(z.string().cuid()).optional().default([]),
    prioritizePerformance: z.boolean().optional().default(true)
  }).optional().default({
    requireAllQualifications: true,
    minPerformanceScore: 0,
    excludeEmployeeIds: [],
    prioritizePerformance: true
  })
});

// Fetch ratings (optional filters)
// const getOrderRatingsSchema = z.object({
//   body: z.object({}).optional(), 
//   params: z.object({
//     orderId: z.string(), // 👈 drop .cuid() unless you are 100% sure your IDs are cuid
//   }),
//   query: z
//     .object({
//       status: RatingStatusEnum.optional(),
//       employeeId: z.string().cuid().optional(),
//       customerId: z.string().cuid().optional(),
//     })
//     .optional(), // 👈 allow query itself to be missing
// });



