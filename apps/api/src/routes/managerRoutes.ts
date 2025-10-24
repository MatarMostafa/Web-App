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
      const managers = await prisma.user.findMany({
        where: { 
          role: { in: ["ADMIN", "TEAM_LEADER", "HR_MANAGER"] },
          isActive: true 
        },
        select: { 
          id: true, 
          employee: { 
            select: { firstName: true, lastName: true } 
          } 
        },
        orderBy: { 
          employee: { firstName: "asc" } 
        },
      });
      res.json(managers);
    } catch (error) {
      res.status(500).json({ message: "Error fetching managers", error });
    }
  }
);

export default router;