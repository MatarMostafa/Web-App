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
  Briefcase,
  UserCheck,
  CalendarDays,
  Award,
} from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

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
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

const EmployeeSidebar: React.FC<SidebarProps> = ({
  isOpen = false,
  onClose,
}) => {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const isSettingsPath = pathname.startsWith("/settings");

  const dashboardNavItems = [
    { name: t('navigation.dashboard'), path: "/dashboard-employee", icon: LayoutGrid },
    { name: t('navigation.orders'), path: "/dashboard-employee/orders", icon: FileBox },
    { name: t('navigation.leaveManagement'), path: "/dashboard-employee/leaves", icon: CalendarDays },
    { name: t('navigation.skills'), path: "/dashboard-employee/skills", icon: Award },
  ];

  const settingsNavItems = [
    { name: t('navigation.profile'), path: "/settings", icon: User },
    { name: t('navigation.notifications'), path: "/settings/notifications", icon: Bell },
    { name: t('navigation.privacySecurity'), path: "/settings/privacy", icon: Shield },
    { name: t('navigation.helpSupport'), path: "/settings/help", icon: HelpCircle },
  ];

  const navItems = isSettingsPath ? settingsNavItems : dashboardNavItems;

  const handleNavClick = () => {
    if (isMobile && onClose) {
      onClose();
    }
  };

  const { logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
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
          "overflow-y-auto border-r border-[#949494] bg-[#222222] transition-all duration-300 fixed z-50",
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
                  className="text-[#ffffff] hover:text-white"
                >
                  <X className="h-5 w-5" />
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setCollapsed(!collapsed)}
                  className="text-[#ffffff] hover:text-white"
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
                  (item.path === "/dashboard-employee/leaves" &&
                    pathname.startsWith("/dashboard-employee/leaves")) ||
                  (item.path === "/dashboard-employee/orders" &&
                    pathname.startsWith("/dashboard-employee/orders/")) ||
                  (item.path === "/dashboard-employee/skills" &&
                    pathname.startsWith("/dashboard-employee/skills"));
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
                              ? "bg-[#222222] hover:bg-[#444444] text-white font-medium"
                              : "text-[#ffffff] hover:text-white hover:bg-[#444444]",
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

          <div className="mt-auto pt-4 border-t border-[#b4b4b4]">
            <TooltipProvider delayDuration={collapsed ? 100 : 1000}>
              <div className="space-y-1">
                {isSettingsPath ? (
                  <>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          className={cn(
                            "w-full justify-start text-[#ffffff] hover:text-white hover:bg-[#444444]",
                            collapsed ? "px-2" : "px-3"
                          )}
                          asChild
                        >
                          <Link
                            href="/dashboard-employee"
                            onClick={handleNavClick}
                          >
                            <ArrowLeft
                              className={cn(
                                "h-5 w-5",
                                collapsed && !isMobile ? "mr-0" : "mr-2"
                              )}
                            />
                            {(!collapsed || isMobile) && (
                              <span>{t('navigation.backToDashboard')}</span>
                            )}
                          </Link>
                        </Button>
                      </TooltipTrigger>
                      {collapsed && !isMobile && (
                        <TooltipContent side="right">
                          {t('navigation.backToDashboard')}
                        </TooltipContent>
                      )}
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          onClick={handleLogout}
                          className={cn(
                            "w-full justify-start text-[#ffffff] hover:text-white hover:bg-[#444444]",
                            collapsed ? "px-2" : "px-3"
                          )}
                        >
                          <LogOut
                            className={cn(
                              "h-5 w-5",
                              collapsed && !isMobile ? "mr-0" : "mr-2"
                            )}
                          />
                          {(!collapsed || isMobile) && <span>{t('navigation.logOut')}</span>}
                        </Button>
                      </TooltipTrigger>
                      {collapsed && !isMobile && (
                        <TooltipContent side="right">{t('navigation.logOut')}</TooltipContent>
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
                            "w-full justify-start text-[#ffffff] hover:text-white hover:bg-[#444444]",
                            collapsed ? "px-2" : "px-3"
                          )}
                          asChild
                        >
                          <Link href="/dashboard-employee/settings" onClick={handleNavClick}>
                            <Settings
                              className={cn(
                                "h-5 w-5",
                                collapsed && !isMobile ? "mr-0" : "mr-2"
                              )}
                            />
                            {(!collapsed || isMobile) && <span>{t('navigation.settings')}</span>}
                          </Link>
                        </Button>
                      </TooltipTrigger>
                      {collapsed && !isMobile && (
                        <TooltipContent side="right">{t('navigation.settings')}</TooltipContent>
                      )}
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          onClick={handleLogout}
                          className={cn(
                            "w-full justify-start text-[#ffffff] hover:text-white hover:bg-[#444444]",
                            collapsed ? "px-2" : "px-3"
                          )}
                        >
                          <LogOut
                            className={cn(
                              "h-5 w-5",
                              collapsed && !isMobile ? "mr-0" : "mr-2"
                            )}
                          />
                          {(!collapsed || isMobile) && <span>{t('navigation.logOut')}</span>}
                        </Button>
                      </TooltipTrigger>
                      {collapsed && !isMobile && (
                        <TooltipContent side="right">{t('navigation.logOut')}</TooltipContent>
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

export default EmployeeSidebar;