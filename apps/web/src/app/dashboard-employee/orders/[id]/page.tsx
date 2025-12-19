"use client";

import { useParams } from "next/navigation";
import { EmployeeOrderDetailPage } from "@/components/employee/EmployeeOrderDetailPage";

export default function EmployeeOrderDetailPageRoute() {
  const params = useParams();
  const orderId = params.id as string;

  return <EmployeeOrderDetailPage orderId={orderId} />;
}