"use client";

import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Sidebar } from "@/components/customer/Sidebar";
import Header from "@/components/Header";
import { cn } from "@/lib/utils/helpers";
import { useIsMobile } from "@/hooks/use-mobile";
import { useLayoutStore } from "@/store/layoutStore";

export default function CustomerDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const isMobile = useIsMobile();
  const fullWidth = useLayoutStore((state) => state.fullWidth);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push("/login");
      return;
    }

    if (session.user.role !== "CUSTOMER") {
      // Redirect non-customers to appropriate dashboard
      if (session.user.role === "ADMIN") {
        router.push("/dashboard-admin");
      } else if (session.user.role === "EMPLOYEE") {
        router.push("/dashboard-employee");
      } else {
        router.push("/login");
      }
      return;
    }
  }, [session, status, router]);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!session || session.user.role !== "CUSTOMER") {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header onMenuClick={() => setSidebarOpen(true)} />
      <div className="flex flex-col md:flex-row">
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        <main
          className={cn(
            "flex-1 overflow-y-auto bg-gray-50/50 transition-all duration-300",
            isMobile ? "px-3 py-4" : "p-4 md:p-8",
            fullWidth && "p-0",
            !isMobile && "md:ml-64"
          )}
        >
          <div
            className={cn(
              "mx-auto",
              isMobile ? "max-w-full" : "max-w-[90vw]",
              fullWidth && "max-w-none"
            )}
          >
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}