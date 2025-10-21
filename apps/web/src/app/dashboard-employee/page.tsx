"use client";
import EmployeesPage from "@/components/pages/admin/EmployeesPage";
import { useSession } from "next-auth/react";

export default function EmployeeDashboard() {
  const { data: session } = useSession();

  return <EmployeesPage />;
}
