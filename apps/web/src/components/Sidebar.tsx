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
// import { SidebarSearch } from "./SidebarSearch";

/**
 * Application Sidebar component
 *
 * Provides navigation links and collapsible functionality
 */
const Sidebar: React.FC<SidebarProps> = ({ isOpen = false, onClose }) => {
  const isMobile = useIsMobile();
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const isSettingsPath = pathname.startsWith("/settings");

  const dashboardNavItems = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutGrid },
    { name: "Contacts", path: "/dashboard/contacts", icon: Users },
    {
      name: "Collaborations",
      path: "/dashboard/collaboration",
      icon: FolderOpen,
    },
    {
      name: "Data Management",
      path: "/dashboard/data-management",
      icon: Database,
    },
    { name: "Calendar", path: "/dashboard/reminders", icon: Calendar },
    { name: "AI Search", path: "/dashboard/search", icon: Search },
  ];

  const settingsNavItems = [
    { name: "Profile", path: "/settings", icon: User },
    {
      name: "Subscription & Billing",
      path: "/settings/subscription",
      icon: CreditCard,
    },
    // { name: "Data Management", path: "/settings/data", icon: Database },
    { name: "Notifications", path: "/settings/notifications", icon: Bell },
    { name: "Privacy & Security", path: "/settings/privacy", icon: Shield },
    { name: "Help & Support", path: "/settings/help", icon: HelpCircle },
    // { name: "Sign Out", path: "/settings/signout", icon: LogOut },
  ];

  const navItems = isSettingsPath ? settingsNavItems : dashboardNavItems;

  // Handle mobile drawer close when clicking on nav items
  const handleNavClick = () => {
    if (isMobile && onClose) {
      onClose();
    }
  };

  // Don't render on mobile unless it's open as a drawer
  if (isMobile && !isOpen) return null;

  return (
    <>
      {/* Mobile overlay */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      <div
        className={cn(
          "overflow-y-auto border-r border-[#2a3b5a] bg-[#1b2d39] transition-all duration-300 fixed z-50",
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
          {/* Main Navigation */}
          <div>
            <div className="flex items-center justify-end mb-6">
              {isMobile ? (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="text-[#D1C4E9] hover:text-white"
                >
                  <X className="h-5 w-5" />
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setCollapsed(!collapsed)}
                  className="text-[#D1C4E9] hover:text-white"
                >
                  {collapsed ? (
                    <ChevronRight className="h-5 w-5" />
                  ) : (
                    <ChevronLeft className="h-5 w-5" />
                  )}
                </Button>
              )}
            </div>

            {/* <SidebarSearch collapsed={collapsed} /> */}
            <nav className="space-y-1">
              {navItems.map((item) => {
                const isActive =
                  pathname === item.path ||
                  (item.path === "/dashboard/contacts" &&
                    pathname.startsWith("/dashboard/contacts/")) ||
                  (item.path === "/dashboard/collaboration" &&
                    pathname.startsWith("/dashboard/collaboration/")) ||
                  (item.path === "/dashboard/data-management" &&
                    pathname.startsWith("/dashboard/data-management/"));
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
                              ? "bg-[#3A2A5A] hover:bg-[#3A2A5A]/90 text-white font-medium"
                              : "text-[#D1C4E9] hover:text-white hover:bg-[#2F2550]/60",
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

          {/* Bottom Actions */}
          <div className="mt-auto pt-4 border-t border-[#3A2A5A]">
            <TooltipProvider delayDuration={collapsed ? 100 : 1000}>
              <div className="space-y-1">
                {isSettingsPath ? (
                  <>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          className={cn(
                            "w-full justify-start text-[#D1C4E9] hover:text-white hover:bg-[#2F2550]/60",
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
                            "w-full justify-start text-[#D1C4E9] hover:text-white hover:bg-[#2F2550]/60",
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
                            "w-full justify-start text-[#D1C4E9] hover:text-white hover:bg-[#2F2550]/60",
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
                            "w-full justify-start text-[#D1C4E9] hover:text-white hover:bg-[#2F2550]/60",
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
