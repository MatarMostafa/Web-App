import express, { Request, Response } from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import { roleMiddleware } from "../middleware/roleMiddleware";
import { validateRequest } from "../middleware/validateRequest";
import { z } from "zod";
import { prisma } from "@repo/db";

const router = express.Router();

// Validation schemas
const createContainerSchema = z.object({
  params: z.object({ orderId: z.string().cuid() }),
  body: z.object({
    serialNumber: z.string().min(1),
    cartonQuantity: z.number().int().positive(),
    articleQuantity: z.number().int().positive(),
    cartonPrice: z.number().positive(),
    articlePrice: z.number().positive(),
    articles: z.array(z.object({
      articleName: z.string().min(1),
      quantity: z.number().int().positive(),
      price: z.number().positive()
    })).optional(),
    employeeIds: z.array(z.string().cuid()).optional()
  })
});

const updateContainerSchema = z.object({
  params: z.object({ id: z.string().cuid() }),
  body: z.object({
    serialNumber: z.string().min(1).optional(),
    cartonQuantity: z.number().int().positive().optional(),
    articleQuantity: z.number().int().positive().optional(),
    cartonPrice: z.number().positive().optional(),
    articlePrice: z.number().positive().optional()
  })
});

const assignEmployeeSchema = z.object({
  params: z.object({ containerId: z.string().cuid() }),
  body: z.object({
    employeeId: z.string().cuid(),
    role: z.string().optional()
  })
});

// Get containers for an order
router.get(
  "/order/:orderId",
  authMiddleware,
  roleMiddleware(["ADMIN", "TEAM_LEADER", "EMPLOYEE"]),
  async (req: Request, res: Response) => {
    try {
      const { orderId } = req.params;

      const containers = await prisma.container.findMany({
        where: { orderId },
        include: {
          articles: true,
          employeeAssignments: {
            include: {
              employee: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  employeeCode: true
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'asc' }
      });

      res.json({ success: true, data: containers });
    } catch (error) {
      console.error("Get containers error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch containers",
        error: String(error)
      });
    }
  }
);

// Create container
router.post(
  "/order/:orderId",
  authMiddleware,
  roleMiddleware(["ADMIN", "TEAM_LEADER"]),
  validateRequest(createContainerSchema),
  async (req: Request, res: Response) => {
    try {
      const { orderId } = req.params;
      const { serialNumber, cartonQuantity, articleQuantity, cartonPrice, articlePrice, articles, employeeIds } = req.body;

      const container = await prisma.container.create({
        data: {
          serialNumber,
          orderId,
          cartonQuantity,
          articleQuantity,
          cartonPrice,
          articlePrice,
          articles: articles ? {
            create: articles
          } : undefined,
          employeeAssignments: employeeIds ? {
            create: employeeIds.map((employeeId: string) => ({
              employeeId
            }))
          } : undefined
        },
        include: {
          articles: true,
          employeeAssignments: {
            include: {
              employee: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  employeeCode: true
                }
              }
            }
          }
        }
      });

      res.json({ success: true, data: container });
    } catch (error) {
      console.error("Create container error:", error);
      res.status(400).json({
        success: false,
        message: "Failed to create container",
        error: String(error)
      });
    }
  }
);

// Update container
router.put(
  "/:id",
  authMiddleware,
  roleMiddleware(["ADMIN", "TEAM_LEADER"]),
  validateRequest(updateContainerSchema),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const container = await prisma.container.update({
        where: { id },
        data: updateData,
        include: {
          articles: true,
          employeeAssignments: {
            include: {
              employee: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  employeeCode: true
                }
              }
            }
          }
        }
      });

      res.json({ success: true, data: container });
    } catch (error) {
      console.error("Update container error:", error);
      res.status(400).json({
        success: false,
        message: "Failed to update container",
        error: String(error)
      });
    }
  }
);

// Delete container
router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware(["ADMIN", "TEAM_LEADER"]),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      await prisma.container.delete({
        where: { id }
      });

      res.json({ success: true, message: "Container deleted successfully" });
    } catch (error) {
      console.error("Delete container error:", error);
      res.status(400).json({
        success: false,
        message: "Failed to delete container",
        error: String(error)
      });
    }
  }
);

// Assign employee to container
router.post(
  "/:containerId/employees",
  authMiddleware,
  roleMiddleware(["ADMIN", "TEAM_LEADER"]),
  validateRequest(assignEmployeeSchema),
  async (req: Request, res: Response) => {
    try {
      const { containerId } = req.params;
      const { employeeId, role } = req.body;

      const assignment = await prisma.containerEmployee.create({
        data: {
          containerId,
          employeeId,
          role
        },
        include: {
          employee: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              employeeCode: true
            }
          }
        }
      });

      res.json({ success: true, data: assignment });
    } catch (error) {
      console.error("Assign employee error:", error);
      res.status(400).json({
        success: false,
        message: "Failed to assign employee",
        error: String(error)
      });
    }
  }
);

// Remove employee from container
router.delete(
  "/:containerId/employees/:employeeId",
  authMiddleware,
  roleMiddleware(["ADMIN", "TEAM_LEADER"]),
  async (req: Request, res: Response) => {
    try {
      const { containerId, employeeId } = req.params;

      await prisma.containerEmployee.delete({
        where: {
          containerId_employeeId: {
            containerId,
            employeeId
          }
        }
      });

      res.json({ success: true, message: "Employee removed from container" });
    } catch (error) {
      console.error("Remove employee error:", error);
      res.status(400).json({
        success: false,
        message: "Failed to remove employee",
        error: String(error)
      });
    }
  }
);

export default router;