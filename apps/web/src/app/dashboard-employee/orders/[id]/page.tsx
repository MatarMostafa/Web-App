"use client";

import { useParams } from "next/navigation";
import { OrderDetailPage } from "@/components/order-detail/OrderDetailPage";

export default function EmployeeOrderDetailPage() {
  const params = useParams();
  const orderId = params.id as string;

  return <OrderDetailPage orderId={orderId} userRole="EMPLOYEE" />;
}