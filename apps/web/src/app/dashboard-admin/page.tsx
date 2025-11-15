"use client";
import AdminDashboardPage from "@/components/pages/admin/AdminDashboard";
import { useSession } from "next-auth/react";

export default function AdminDashboard() {
  const { data: session } = useSession();

  return <AdminDashboardPage />;
}
