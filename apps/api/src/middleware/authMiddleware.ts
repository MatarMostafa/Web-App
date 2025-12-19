import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "@repo/db";

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string | null;
    username: string;
    role: string;
    isActive: boolean;
    employee?: {
      isAvailable: boolean;
    } | null;
    customer?: {
      id: string;
      isActive: boolean;
    } | null;
    subAccount?: {
      id: string;
      customerId: string;
      isActive: boolean;
    } | null;
  };
}

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authReq = req as AuthRequest;
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key"
    ) as any;
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        isActive: true,
        employee: {
          select: {
            isAvailable: true,
          },
        },
        customer: {
          select: {
            id: true,
            isActive: true,
          },
        },
        subAccount: {
          select: {
            id: true,
            customerId: true,
            isActive: true,
          },
        },
      },
    });

    if (!user || !user.isActive) {
      return res.status(401).json({ message: "User not found or inactive" });
    }

    if (user.employee && !user.employee.isAvailable) {
      return res.status(403).json({ message: "Ihr Zugang zum System wurde gesperrt. Bitte wenden Sie sich an den Administrator." });
    }

    if (user.customer && !user.customer.isActive) {
      return res.status(403).json({ message: "Ihr Kundenkonto wurde deaktiviert. Bitte wenden Sie sich an den Support." });
    }

    if (user.subAccount && !user.subAccount.isActive) {
      return res.status(403).json({ message: "Ihr Sub-Account wurde deaktiviert. Bitte wenden Sie sich an den Administrator." });
    }

    authReq.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ message: "Invalid token" });
  }
};
