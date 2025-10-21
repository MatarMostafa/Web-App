"use client";
import { useSession } from "next-auth/react";

export default function AdminDashboard() {
  const { data: session } = useSession();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      <p>Welcome, {session?.user?.name}!</p>
      <p>Role: {session?.user?.role}</p>
    </div>
  );
}