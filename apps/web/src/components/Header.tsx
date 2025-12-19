import React from "react";
import { User, Menu } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { NotificationDropdown } from "@/components/notifications/NotificationDropdown";
import { Button } from "@/components/ui";
import Link from "next/link";
import Image from "next/image";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui";

interface HeaderProps {
  onMenuClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { logout } = useAuthStore();

  return (
    <header className="sticky top-0 z-20 w-full border-b border-border bg-background shadow-sm">
      <div className="flex items-center justify-between gap-2 px-4 py-2 md:py-3">
        {/* Left Section */}
        <div className="flex items-center gap-2 min-w-0">
          {/* Mobile Menu */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={onMenuClick}
          >
            <Menu className="h-5 w-5" />
          </Button>

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/img/matar_Logo.png"
              alt="ERP Beta"
              width={120}
              height={40}
              priority
              className="h-7 w-auto md:h-8"
            />
          </Link>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2 md:gap-3">
          <NotificationDropdown />

          <div className="hidden sm:block">
            <LanguageSwitcher />
          </div>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 md:h-10 md:w-10 rounded-full"
              >
                <User className="h-5 w-5" />
                <span className="sr-only">User menu</span>
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem
                onClick={logout}
                className="cursor-pointer py-2"
              >
                Log Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Header;
