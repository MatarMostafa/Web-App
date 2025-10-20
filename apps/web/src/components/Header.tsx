import React from "react";

import {
  LayoutGrid,
  Users,
  Presentation,
  User,
  Bell,
  Search,
  Menu,
  Calendar,
} from "lucide-react";

interface HeaderProps {
  onMenuClick?: () => void;
}
import { Button } from "@repo/ui";
import { cn } from "@/lib/utils/helpers";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@repo/ui";

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const pathname = usePathname();
  type NavItem = {
    name: string;
    path: string;
    icon: React.ElementType;
  };

  const navItems: NavItem[] = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutGrid },
    { name: "Contacts", path: "/dashboard/contacts", icon: Users },
    { name: "Calender", path: "/dashboard/reminders", icon: Calendar },
    // { name: "Present", path: "/present", icon: Presentation },
  ];

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
              src="/img/fe441c05-5318-4144-ba3b-7e5227ec2afa.png"
              alt="MetMe Logo"
              className="h-8 w-8"
              width={32}
              height={32}
            />
            <span className="font-display text-2xl font-semibold">MetMe</span>
          </Link>

          <nav className="hidden md:flex space-x-2">
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
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {/* <UpgradeButton />
          
          <AddContactDialogNew
            trigger={
              <Button className="bg-primary hover:bg-primary/90 hidden md:flex font-medium">
                Add Contact
              </Button>
            }
          />  */}

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
              <DropdownMenuItem asChild>
                <Link href="/settings">Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuItem>Log Out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Header;
