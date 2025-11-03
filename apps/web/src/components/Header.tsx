import React from "react";
import { User, Menu } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import LanguageSwitcher from "@/components/LanguageSwitcher";

interface HeaderProps {
  onMenuClick?: () => void;
}
import { Button } from "@/components/ui";
import Link from "next/link";
import Image from "next/image";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui";

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { logout } = useAuthStore();

  return (
    <header className="border-b border-border bg-background sticky top-0 z-10 shadow-sm">
      <div className="container max-w-full px-4 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center">
          {/* Mobile hamburger menu */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden mr-2"
            onClick={onMenuClick}
          >
            <Menu className="h-5 w-5" />
          </Button>

          <Link href="/" className="flex items-center gap-2 mr-8">
            <Image
              src="/img/matar_Logo.png"
              alt="ERP Beta"
              width={120}
              height={40}
              className="h-8 w-auto"
            />
          </Link>

          {/* <nav className="hidden md:flex space-x-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.path ||
                (item.path === "/contacts" && pathname === "/");

              return (
                <Button
                  key={item.name}
                  variant={isActive ? "default" : "ghost"}
                  className={cn(
                    isActive
                      ? "bg-primary hover:bg-primary/90"
                      : "text-foreground",
                    "gap-2 font-medium"
                  )}
                  asChild
                >
                  <Link href={item.path}>
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </Link>
                </Button>
              );
            })}
          </nav> */}
        </div>

        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full w-10 h-10 ml-2"
              >
                <User className="h-5 w-5" />
                <span className="sr-only">User menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {/* <DropdownMenuItem asChild>
                <Link href="/settings">Profile</Link>
              </DropdownMenuItem> */}
              <DropdownMenuItem
                className="px-2 py-3 cursor-pointer text-black"
                onClick={logout}
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
