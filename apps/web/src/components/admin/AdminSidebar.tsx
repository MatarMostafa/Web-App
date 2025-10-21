import React, { useEffect, useState } from "react";
import {
  LayoutGrid,
  Users,
  Calendar,
  MessageSquare,
  Search,
  Settings,
  HelpCircle,
  LogOut,
  ChevronLeft,
  ChevronRight,
  X,
  FolderOpen,
  Database,
  User,
  CreditCard,
  Bell,
  Shield,
  ArrowLeft,
  FileBox,
  Contact,
} from "lucide-react";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}
import { cn } from "@/lib/utils/helpers";
import { Button } from "@repo/ui";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@repo/ui";
import { useIsMobile } from "@/hooks/use-mobile";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const Sidebar: React.FC<SidebarProps> = ({ isOpen = false, onClose }) => {
  const isMobile = useIsMobile();
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const isSettingsPath = pathname.startsWith("/settings");

  const dashboardNavItems = [
    { name: "Dashboard", path: "/dashboard-admin", icon: LayoutGrid },
    { name: "Employees", path: "/dashboard-admin/employees", icon: Users },
    { name: "Customers", path: "/dashboard-admin/customers", icon: Contact },
    { name: "Orders", path: "/dashboard-admin/orders", icon: FileBox },
  ];

  const settingsNavItems = [
    { name: "Profile", path: "/settings", icon: User },
    { name: "Notifications", path: "/settings/notifications", icon: Bell },
    { name: "Privacy & Security", path: "/settings/privacy", icon: Shield },
    { name: "Help & Support", path: "/settings/help", icon: HelpCircle },
  ];

  const navItems = isSettingsPath ? settingsNavItems : dashboardNavItems;

  const handleNavClick = () => {
    if (isMobile && onClose) {
      onClose();
    }
  };

  if (isMobile && !isOpen) return null;

  return (
    <>
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      <div
        className={cn(
          "overflow-y-auto border-r border-[#1e3a8a] bg-[#0f172a] transition-all duration-300 fixed z-50",
          isMobile
            ? cn(
                "h-screen w-64 left-0 top-0",
                isOpen ? "translate-x-0" : "-translate-x-full"
              )
            : cn(
                "h-[calc(100vh-65px)] max-h-[calc(100vh-65px)] top-[65px] left-0",
                collapsed ? "w-[70px]" : "w-64"
              )
        )}
      >
        <div className="flex flex-col justify-between h-full p-3">
          <div>
            <div className="flex items-center justify-end mb-6">
              {isMobile ? (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="text-[#BFDBFE] hover:text-white"
                >
                  <X className="h-5 w-5" />
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setCollapsed(!collapsed)}
                  className="text-[#BFDBFE] hover:text-white"
                >
                  {collapsed ? (
                    <ChevronRight className="h-5 w-5" />
                  ) : (
                    <ChevronLeft className="h-5 w-5" />
                  )}
                </Button>
              )}
            </div>

            <nav className="space-y-1">
              {navItems.map((item) => {
                const isActive =
                  pathname === item.path ||
                  (item.path === "/dashboard-admin/employees" &&
                    pathname.startsWith("/dashboard-admin/employees")) ||
                  (item.path === "/dashboard-admin/customers" &&
                    pathname.startsWith("/dashboard-admin/customers/")) ||
                  (item.path === "/dashboard-admin/orders" &&
                    pathname.startsWith("/dashboard-admin/orders/"));
                const Icon = item.icon;

                return (
                  <TooltipProvider
                    key={item.path}
                    delayDuration={collapsed ? 100 : 1000}
                  >
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant={isActive ? "secondary" : "ghost"}
                          className={cn(
                            "w-full justify-start",
                            isActive
                              ? "bg-[#1E3A8A] hover:bg-[#1E40AF]/90 text-white font-medium"
                              : "text-[#BFDBFE] hover:text-white hover:bg-[#1D4ED8]/60",
                            collapsed && !isMobile ? "px-2" : "px-3"
                          )}
                          asChild
                        >
                          <Link href={item.path} onClick={handleNavClick}>
                            <Icon
                              className={cn(
                                "h-5 w-5",
                                collapsed && !isMobile ? "mr-0" : "mr-2"
                              )}
                            />
                            {(!collapsed || isMobile) && (
                              <span>{item.name}</span>
                            )}
                          </Link>
                        </Button>
                      </TooltipTrigger>
                      {collapsed && !isMobile && (
                        <TooltipContent side="right">
                          {item.name}
                        </TooltipContent>
                      )}
                    </Tooltip>
                  </TooltipProvider>
                );
              })}
            </nav>
          </div>

          <div className="mt-auto pt-4 border-t border-[#1E40AF]">
            <TooltipProvider delayDuration={collapsed ? 100 : 1000}>
              <div className="space-y-1">
                {isSettingsPath ? (
                  <>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          className={cn(
                            "w-full justify-start text-[#BFDBFE] hover:text-white hover:bg-[#1D4ED8]/60",
                            collapsed ? "px-2" : "px-3"
                          )}
                          asChild
                        >
                          <Link href="/dashboard" onClick={handleNavClick}>
                            <ArrowLeft
                              className={cn(
                                "h-5 w-5",
                                collapsed && !isMobile ? "mr-0" : "mr-2"
                              )}
                            />
                            {(!collapsed || isMobile) && (
                              <span>Back to Dashboard</span>
                            )}
                          </Link>
                        </Button>
                      </TooltipTrigger>
                      {collapsed && !isMobile && (
                        <TooltipContent side="right">
                          Back to Dashboard
                        </TooltipContent>
                      )}
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          className={cn(
                            "w-full justify-start text-[#BFDBFE] hover:text-white hover:bg-[#1D4ED8]/60",
                            collapsed ? "px-2" : "px-3"
                          )}
                        >
                          <LogOut
                            className={cn(
                              "h-5 w-5",
                              collapsed && !isMobile ? "mr-0" : "mr-2"
                            )}
                          />
                          {(!collapsed || isMobile) && <span>Log Out</span>}
                        </Button>
                      </TooltipTrigger>
                      {collapsed && !isMobile && (
                        <TooltipContent side="right">Log Out</TooltipContent>
                      )}
                    </Tooltip>
                  </>
                ) : (
                  <>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          className={cn(
                            "w-full justify-start text-[#BFDBFE] hover:text-white hover:bg-[#1D4ED8]/60",
                            collapsed ? "px-2" : "px-3"
                          )}
                          asChild
                        >
                          <Link href="/settings" onClick={handleNavClick}>
                            <Settings
                              className={cn(
                                "h-5 w-5",
                                collapsed && !isMobile ? "mr-0" : "mr-2"
                              )}
                            />
                            {(!collapsed || isMobile) && <span>Settings</span>}
                          </Link>
                        </Button>
                      </TooltipTrigger>
                      {collapsed && !isMobile && (
                        <TooltipContent side="right">Settings</TooltipContent>
                      )}
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          className={cn(
                            "w-full justify-start text-[#BFDBFE] hover:text-white hover:bg-[#1D4ED8]/60",
                            collapsed ? "px-2" : "px-3"
                          )}
                        >
                          <LogOut
                            className={cn(
                              "h-5 w-5",
                              collapsed && !isMobile ? "mr-0" : "mr-2"
                            )}
                          />
                          {(!collapsed || isMobile) && <span>Log Out</span>}
                        </Button>
                      </TooltipTrigger>
                      {collapsed && !isMobile && (
                        <TooltipContent side="right">Log Out</TooltipContent>
                      )}
                    </Tooltip>
                  </>
                )}
              </div>
            </TooltipProvider>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
