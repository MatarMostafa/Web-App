import React, { useEffect, useState } from "react";
import {
  LayoutGrid,
  FileBox,
  LogOut,
  ChevronLeft,
  ChevronRight,
  X,
  Users,
} from "lucide-react";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}
import { cn } from "@/lib/utils/helpers";
import { Button } from "@/components/ui";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui";
import { useIsMobile } from "@/hooks/use-mobile";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { useTranslation } from "@/hooks/useTranslation";

const TeamLeaderSidebar: React.FC<SidebarProps> = ({ isOpen = false, onClose }) => {
  const { t, ready } = useTranslation();
  const isMobile = useIsMobile();
  const [collapsed, setCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const { logout } = useAuthStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleNavClick = () => {
    if (isMobile && onClose) {
      onClose();
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  if (!mounted || !ready) {
    return (
      <div className={cn(
        "overflow-y-auto border-r border-white/20 bg-linear-to-b from-[#222222] via-[#444444] to-[#222222] backdrop-blur-xl shadow-2xl transition-all duration-300 fixed z-50",
        isMobile
          ? cn(
              "h-screen w-64 left-0 top-0",
              isOpen ? "translate-x-0" : "-translate-x-full"
            )
          : cn(
              "h-[calc(100vh-65px)] max-h-[calc(100vh-65px)] top-[65px] left-0",
              collapsed ? "w-[70px]" : "w-64"
            )
      )}>
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
      </div>
    );
  }

  const navItems = [
    { name: "Dashboard", key: "navigation.dashboard", path: "/dashboard-team-leader", icon: LayoutGrid },
    { name: "Orders", key: "navigation.orders", path: "/dashboard-team-leader/orders", icon: FileBox },
    { name: "My Team", key: "navigation.team", path: "/dashboard-team-leader/teams", icon: Users },
  ];

  if (isMobile && !isOpen) return null;

  return (
    <>
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-white/10 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      <div
        className={cn(
          "overflow-y-auto border-r border-white/20 bg-linear-to-b from-[#222222] via-[#444444] to-[#222222] backdrop-blur-xl shadow-2xl transition-all duration-300 fixed z-50",
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
                  className="text-white hover:bg-white/10 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setCollapsed(!collapsed)}
                  className="text-white hover:bg-white/10 hover:text-white"
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
                  (item.path === "/dashboard-team-leader/orders" &&
                    pathname.startsWith("/dashboard-team-leader/orders"));
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
                              ? "bg-primary hover:bg-[#111111] text-white font-medium"
                              : "text-[#ffffff] hover:text-white hover:bg-[#ffffff]/10",
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
                              <span>{t(item.key, item.name)}</span>
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

          <div className="mt-auto pt-4 border-t border-[#eeeeee]">
            <TooltipProvider delayDuration={collapsed ? 100 : 1000}>
              <div className="space-y-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      onClick={handleLogout}
                      className={cn(
                        "w-full justify-start text-[#ffffff] hover:text-white hover:bg-[#ffffff]/10",
                        collapsed ? "px-2" : "px-3"
                      )}
                    >
                      <LogOut
                        className={cn(
                          "h-5 w-5",
                          collapsed && !isMobile ? "mr-0" : "mr-2"
                        )}
                      />
                      {(!collapsed || isMobile) && <span>{t("navigation.logOut")}</span>}
                    </Button>
                  </TooltipTrigger>
                  {collapsed && !isMobile && (
                    <TooltipContent side="right">{t("navigation.logOut")}</TooltipContent>
                  )}
                </Tooltip>
              </div>
            </TooltipProvider>
          </div>
        </div>
      </div>
    </>
  );
};

export default TeamLeaderSidebar;