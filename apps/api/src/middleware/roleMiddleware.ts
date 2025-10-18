import { Request, Response, NextFunction } from "express";
import { AuthRequest } from "./authMiddleware";

export const roleMiddleware = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const authReq = req as AuthRequest;
    if (!authReq.user || !roles.includes(authReq.user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }
    next();
  };
};
