// src/services/employeePerformanceService.ts
import { prisma } from "@repo/db";
import {
  calculateScore,
  getTrafficLight,
  getTrafficLightReason,
  getDefaultThresholds,
  validateThresholds,
} from "../utils/performanceHelper";

/**
 * List all performance records with employee + override user data
 */
export const listAll = () => {
  return prisma.employeePerformance.findMany({
    include: {
      employee: true,
      manualOverrideBy: true,
    },
  });
};

/**
 * Get a single performance record by ID
 */
export const getById = (id: string) => {
  return prisma.employeePerformance.findUnique({
    where: { id },
    include: {
      employee: true,
      manualOverrideBy: true,
    },
  });
};

/**
 * Get all performance history for an employee
 */
export const getEmployeeHistory = (employeeId: string) => {
  return prisma.employeePerformance.findMany({
    where: { employeeId },
    orderBy: { periodStart: "desc" },
  });
};

/**
 * Create performance record (supports auto or manual override)
 */
export const create = async (data: any) => {
  const {
    employeeId,
    periodStart,
    periodEnd,
    metrics,
    manualOverride,
    score: manualScore,
    trafficLight: manualLight,
    trafficLightReason: manualReason,
    manualOverrideById,
  } = data;

  // 1️⃣ Fetch employee & department
  const employee = await prisma.employee.findUnique({
    where: { id: employeeId },
    include: { department: true },
  });
  if (!employee) throw new Error("Employee not found");

  // 2️⃣ Get department thresholds with fallback
  const dbThresholds = await prisma.performanceThreshold.findUnique({
    where: { departmentId: employee.departmentId || undefined },
  });
  
  let thresholds;
  if (!dbThresholds) {
    console.warn(`No thresholds defined for department ${employee.departmentId}, using defaults`);
    thresholds = getDefaultThresholds();
  } else {
    // Validate existing thresholds
    const validation = validateThresholds(dbThresholds);
    if (!validation.isValid) {
      console.warn(`Invalid thresholds for department ${employee.departmentId}:`, validation.errors);
      thresholds = getDefaultThresholds();
    } else {
      thresholds = dbThresholds;
    }
  }

  // 3️⃣ Auto or manual calculation
  let score, trafficLight, trafficLightReason;

  if (manualOverride) {
    if (manualScore == null || !manualLight)
      throw new Error("Manual override requires score and trafficLight");
    score = manualScore;
    trafficLight = manualLight;
    trafficLightReason = manualReason || getTrafficLightReason(trafficLight, score);
  } else {
    score = calculateScore(metrics);
    trafficLight = getTrafficLight(score, thresholds);
    trafficLightReason = getTrafficLightReason(trafficLight, score);
  }

  // 4️⃣ Create record
  const record = await prisma.employeePerformance.create({
    data: {
      employeeId,
      periodStart,
      periodEnd,
      score,
      trafficLight,
      metrics,
      trafficLightReason,
      manualOverride: !!manualOverride,
      manualOverrideById: manualOverride ? manualOverrideById ?? null : null,
    },
  });

  // 5️⃣ Update employee's current performance snapshot
  await prisma.employee.update({
    where: { id: employeeId },
    data: {
      performanceScore: score,
      trafficLight,
    },
  });

  return record;
};

/**
 * Update existing performance record
 * → Respects manualOverride flag
 */
export const update = async (id: string, data: any) => {
  const existing = await prisma.employeePerformance.findUnique({
    where: { id },
    include: { employee: { include: { department: true } } },
  });
  if (!existing) throw new Error("Performance record not found");

  const metrics = data.metrics || existing.metrics;
  const periodStart = data.periodStart || existing.periodStart;
  const periodEnd = data.periodEnd || existing.periodEnd;
  const manualOverride = data.manualOverride ?? existing.manualOverride;
  const manualOverrideById =
    data.manualOverrideById ?? existing.manualOverrideById ?? null;

  // 1️⃣ Get thresholds with fallback
  const dbThresholds = await prisma.performanceThreshold.findUnique({
    where: { departmentId: existing.employee.departmentId || undefined },
  });
  
  let thresholds;
  if (!dbThresholds) {
    console.warn(`No thresholds defined for department ${existing.employee.departmentId}, using defaults`);
    thresholds = getDefaultThresholds();
  } else {
    const validation = validateThresholds(dbThresholds);
    if (!validation.isValid) {
      console.warn(`Invalid thresholds for department ${existing.employee.departmentId}:`, validation.errors);
      thresholds = getDefaultThresholds();
    } else {
      thresholds = dbThresholds;
    }
  }

  // 2️⃣ Calculate (auto or manual)
  let score, trafficLight, trafficLightReason;

  if (manualOverride) {
    score = data.score ?? existing.score;
    trafficLight = data.trafficLight ?? existing.trafficLight;
    trafficLightReason =
      data.trafficLightReason ?? getTrafficLightReason(trafficLight, score);
  } else {
    score = calculateScore(metrics);
    trafficLight = getTrafficLight(score, thresholds);
    trafficLightReason = getTrafficLightReason(trafficLight, score);
  }

  // 3️⃣ Update record
  const updated = await prisma.employeePerformance.update({
    where: { id },
    data: {
      metrics,
      periodStart,
      periodEnd,
      score,
      trafficLight,
      trafficLightReason,
      manualOverride,
      manualOverrideById: manualOverride ? manualOverrideById ?? null : null,
    },
  });

  // 4️⃣ Sync employee snapshot
  await prisma.employee.update({
    where: { id: existing.employeeId },
    data: {
      performanceScore: score,
      trafficLight,
    },
  });

  return updated;
};

/**
 * Delete performance record
 * → Re-syncs employee with most recent remaining record
 */
export const remove = async (id: string) => {
  const record = await prisma.employeePerformance.delete({
    where: { id },
  });

  const lastRecord = await prisma.employeePerformance.findFirst({
    where: { employeeId: record.employeeId },
    orderBy: { periodStart: "desc" },
  });

  await prisma.employee.update({
    where: { id: record.employeeId },
    data: lastRecord
      ? {
          performanceScore: lastRecord.score,
          trafficLight: lastRecord.trafficLight,
        }
      : {
          performanceScore: null,
          trafficLight: null,
        },
  });

  return record;
};