"use client";

import EmployeeDashboardPage from "@/components/pages/employee/EmployeeDashboardPage";
import { useSession } from "next-auth/react";

export default function EmployeeDashboard() {
  const { data: session } = useSession();

  return <EmployeeDashboardPage />;
}
