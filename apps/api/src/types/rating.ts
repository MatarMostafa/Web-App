// src/types/rating.ts
import { RatingStatus } from "../types";
// Rating inside an order (employee performance, etc.)
export interface Rating {
  id: string;
  orderId?: string;
  employeeId?: string;
  customerId?: string;

  rating: number;
  comment?: string;
  category?: string;
  status: RatingStatus;

  ratedBy?: string;
  ratingDate: Date;

  createdAt: Date;
  updatedAt: Date;
}
