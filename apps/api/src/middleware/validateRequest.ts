// src/middleware/validateRequest.ts
import { Request, Response, NextFunction } from "express";
import { ZodType } from "zod";

export const validateRequest =
  (schema: ZodType<any>) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      // Parse body (you can also validate query/params by passing them)
      const parsed = schema.parse({
        body: req.body,
        params: req.params,
        query: req.query,
      });

      // Replace body/params/query with parsed values (optional)
      if (parsed.body) req.body = parsed.body;
      if (parsed.params) req.params = parsed.params;
      if (parsed.query) req.query = parsed.query;
      next();
    } catch (err: any) {
      return res
        .status(400)
        .json({ message: "Validation failed", issues: err || err });
    }
  };
