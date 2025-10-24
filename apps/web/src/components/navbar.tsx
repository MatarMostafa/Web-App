"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui";
import { Menu, X, User } from "lucide-react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui";

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    setIsMenuOpen(false);
  };

  return (
    <header className="fixed top-0 w-full bg-white/90 backdrop-blur-md border-b border-slate-200 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-primary to-yellow-400 rounded-lg flex items-center justify-center">
                <div className="w-6 h-6 bg-white rounded-full"></div>
              </div>
              <span className="text-2xl font-bold" data-testid="logo-ERP">
                <span className="text-black">Met</span>
                <span className="text-primary">Me</span>
              </span>
            </div>
          </div>

          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <button
                onClick={() => scrollToSection("features")}
                className="text-slate-600 hover:text-primary transition-colors duration-200 font-medium"
                data-testid="nav-features"
              >
                Features
              </button>
              <button
                onClick={() => scrollToSection("how-it-works")}
                className="text-slate-600 hover:text-primary transition-colors duration-200 font-medium"
                data-testid="nav-how-it-works"
              >
                How It Works
              </button>
              <button
                onClick={() => scrollToSection("pricing")}
                className="text-slate-600 hover:text-primary transition-colors duration-200 font-medium"
                data-testid="nav-pricing"
              >
                Pricing
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Desktop auth buttons */}
            <div className="hidden md:flex items-center space-x-4">
              {isLoggedIn ? (
                <>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-full w-10 h-10"
                      >
                        <User className="h-5 w-5" />
                        <span className="sr-only">User menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link className="cursor-pointer" href="/dashboard">
                          Dashboard
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link
                          className="cursor-pointer"
                          href="/dashboard/profile"
                        >
                          Profile
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="cursor-pointer">
                        Log Out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <>
                  <Link href="/signup">
                    <Button
                      className="bg-primary text-white px-6 py-2 rounded-lg font-medium hover:bg-primary/90 transition-all duration-200 transform hover:scale-105"
                      data-testid="button-start-trial-header"
                    >
                      Start Free Trial
                    </Button>
                  </Link>
                  <Link href="/login">
                    <Button
                      variant="outline"
                      className="px-6 py-2 rounded-lg font-medium hover:text-white"
                    >
                      Sign In
                    </Button>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              type="button"
              className="md:hidden text-slate-600 hover:text-primary"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              data-testid="button-mobile-menu"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-slate-200">
              <button
                onClick={() => scrollToSection("features")}
                className="block w-full text-left px-3 py-2 text-slate-600 hover:text-primary transition-colors duration-200 font-medium"
                data-testid="mobile-nav-features"
              >
                Features
              </button>
              <button
                onClick={() => scrollToSection("how-it-works")}
                className="block w-full text-left px-3 py-2 text-slate-600 hover:text-primary transition-colors duration-200 font-medium"
                data-testid="mobile-nav-how-it-works"
              >
                How It Works
              </button>
              <button
                onClick={() => scrollToSection("pricing")}
                className="block w-full text-left px-3 py-2 text-slate-600 hover:text-primary transition-colors duration-200 font-medium"
                data-testid="mobile-nav-pricing"
              >
                Pricing
              </button>

              <div className="pt-2 border-t border-slate-200">
                {isLoggedIn ? (
                  <>
                    <div className="px-3 py-2"></div>
                    <Link
                      href="/dashboard"
                      onClick={() => setIsMenuOpen(false)}
                      className="block px-3 py-2 text-slate-600 hover:text-primary transition-colors duration-200 font-medium"
                    >
                      Dashboard
                    </Link>
                    <Link
                      href="/dashboard/profile"
                      onClick={() => setIsMenuOpen(false)}
                      className="block px-3 py-2 text-slate-600 hover:text-primary transition-colors duration-200 font-medium"
                    >
                      Profile
                    </Link>
                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                      }}
                      className="block w-full text-left px-3 py-2 text-slate-600 hover:text-primary transition-colors duration-200 font-medium"
                    >
                      Log Out
                    </button>
                  </>
                ) : (
                  <>
                    <Link href="/signup" className="block px-3 py-2">
                      <Button className="w-full bg-primary text-white rounded-lg font-medium">
                        Start Free Trial
                      </Button>
                    </Link>
                    <Link href="/login" className="block px-3 py-2">
                      <Button
                        variant="outline"
                        className="w-full rounded-lg font-medium"
                      >
                        Sign In
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
