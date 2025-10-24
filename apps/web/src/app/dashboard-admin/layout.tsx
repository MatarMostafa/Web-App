"use client";

import React, { useState } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import Header from "@/components/Header";
import { cn } from "@/lib/utils/helpers";
import { useIsMobile } from "@/hooks/use-mobile";
import { useLayoutStore } from "@/store/layoutStore";

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isMobile = useIsMobile();
  const fullWidth = useLayoutStore((state) => state.fullWidth);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Header onMenuClick={() => setSidebarOpen(true)} />
      <div className="flex flex-col md:flex-row">
        <AdminSidebar
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
};

export default Layout;
