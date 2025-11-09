"use client";

import { useParams } from "next/navigation";
import { OrderDetailPage } from "@/components/order-detail/OrderDetailPage";

export default function AdminOrderDetailPage() {
  const params = useParams();
  const orderId = params.id as string;

  return <OrderDetailPage orderId={orderId} userRole="ADMIN" />;
}