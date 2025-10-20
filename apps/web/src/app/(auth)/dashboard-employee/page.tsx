"use client";
import { useSession } from "next-auth/react";

export default function EmployeeDashboard() {
  const { data: session } = useSession();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Employee Dashboard</h1>
      <p>Welcome, {session?.user?.name}!</p>
      <p>Role: {session?.user?.role}</p>
    </div>
  );
}