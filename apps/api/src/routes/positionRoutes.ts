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
      const positions = await prisma.position.findMany({
        where: { isActive: true },
        select: { 
          id: true, 
          title: true, 
          departmentId: true,
          department: { select: { name: true } }
        },
        orderBy: { title: "asc" },
      });
      res.json(positions);
    } catch (error) {
      res.status(500).json({ message: "Error fetching positions", error });
    }
  }
);

export default router;