import express from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import { roleMiddleware } from "../middleware/roleMiddleware";
import { prisma } from "@repo/db";

const router = express.Router();

router.get(
  "/",
  authMiddleware,
  roleMiddleware(["ADMIN", "TEAM_LEADER", "HR_MANAGER"]),
  async (req, res) => {
    try {
      const departments = await prisma.department.findMany({
        where: { isActive: true },
        select: { id: true, name: true, code: true },
        orderBy: { name: "asc" },
      });
      res.json(departments);
    } catch (error) {
      res.status(500).json({ message: "Error fetching departments", error });
    }
  }
);

export default router;