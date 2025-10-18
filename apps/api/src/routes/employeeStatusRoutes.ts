// src/routes/employeeStatusRoutes.ts
import express from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import { roleMiddleware } from "../middleware/roleMiddleware";
import {
  requestLeave,
  sickReport,
  getBlockStatus,
  blockEmployee,
  unblockEmployee,
  getAllStatuses,
  getStatusById,
} from "../controllers/employeeStatusController";
import { validateRequest } from "../middleware/validateRequest";
import {
  blockSchema,
  unblockSchema,
  leaveSchema,
  sickSchema,
} from "../validation/employeeStatusSchemas";

const router = express.Router();

router.post(
  "/leave",
  authMiddleware,
  roleMiddleware(["EMPLOYEE", "HR_MANAGER", "ADMIN"]),
  validateRequest(leaveSchema),
  requestLeave
);

router.post(
  "/sick",
  authMiddleware,
  roleMiddleware(["EMPLOYEE", "HR_MANAGER", "ADMIN"]),
  validateRequest(sickSchema),
  sickReport
);

router.get(
  "/",
  authMiddleware,
  roleMiddleware(["ADMIN", "HR_MANAGER", "TEAM_LEADER"]),
  getBlockStatus
);

router.post(
  "/block",
  authMiddleware,
  roleMiddleware(["ADMIN", "HR_MANAGER"]),
  validateRequest(blockSchema),
  blockEmployee
);

router.post(
  "/unblock",
  authMiddleware,
  roleMiddleware(["ADMIN", "HR_MANAGER"]),
  validateRequest(unblockSchema),
  unblockEmployee
);

router.get(
  "/status",
  authMiddleware,
  roleMiddleware(["ADMIN", "HR_MANAGER", "TEAM_LEADER"]),
  getAllStatuses
);

router.get(
  "/status/:id",
  authMiddleware,
  roleMiddleware(["ADMIN", "HR_MANAGER", "TEAM_LEADER", "EMPLOYEE"]),
  getStatusById
);

export default router;
