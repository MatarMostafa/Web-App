import Link from "next/link";
import Image from "next/image";
import React from "react";
import {
  Menu,
  X,
  LayoutDashboard,
  Users,
  BarChart3,
  Settings,
  LogIn,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { useLanguageDetection } from "@/hooks/useLanguageDetection";
import LanguageSwitcher from "@/components/LanguageSwitcher";

interface NavigationItem {
  name: string;
  href: string;
  icon?: React.ReactNode;
  isButton?: boolean;
}



const callsToAction: NavigationItem[] = [
  {
    name: "Log In",
    href: "/login",
    icon: <LogIn className="w-4 h-4" />,
    isButton: false,
  },
  { name: "Get Started", href: "/signup", isButton: true },
];



const Navbar = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = React.useState(false);
  useLanguageDetection();

  const navigation = [
    { name: t('navigation.products'), href: "#products" },
    { name: t('navigation.features'), href: "#features" },
    { name: t('navigation.pricing'), href: "#pricing" },
    { name: t('navigation.about'), href: "#about" },
  ];

  const mobileMenuItems = [
    {
      name: t('navigation.dashboard'),
      href: "/dashboard-employee",
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
  ];

  return (
    <nav className="bg-white shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between items-center">
          {/* Logo section */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center">
              <Image
                src="/img/matar_Logo.png"
                alt="ERP Beta"
                width={120}
                height={40}
                className="h-8 w-auto"
              />
            </Link>
          </div>

          {/* Desktop navigation */}
          <div className="hidden md:flex md:items-center md:space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-gray-600 hover:text-primary px-3 py-2 text-sm font-medium transition-colors"
              >
                {item.name}
              </Link>
            ))}

            {/* Call to action buttons */}
            <div className="flex items-center space-x-4">
              <LanguageSwitcher />
              <Link
                href="/login"
                className="text-gray-600 hover:text-primary px-3 py-2 text-sm font-medium flex items-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                {t('navigation.login')}
              </Link>
              <Button
                onClick={() => {
                  router.push("/signup");
                }}
                className="bg-secondary hover:text-[#d4f3ff]"
              >
                {t('navigation.getStarted')}
              </Button>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center rounded-md p-2 text-gray-700 hover:bg-gray-100 focus:outline-none"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden">
          <div className="space-y-1 px-4 pb-3 pt-2">
            {mobileMenuItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-blue-600"
                onClick={() => setIsOpen(false)}
              >
                {item.icon}
                {item.name}
              </Link>
            ))}
            <div className="mt-4 flex flex-col gap-2">
              <div className="mb-2">
                <LanguageSwitcher />
              </div>
              <Button
                variant="outline"
                className="w-full justify-start gap-2"
                onClick={() => {
                  setIsOpen(false);
                  router.push("/login");
                }}
              >
                <LogIn className="w-4 h-4" />
                {t('navigation.login')}
              </Button>
              <Button
                className="w-full bg-secondary hover:text-[#d4f3ff]"
                onClick={() => {
                  setIsOpen(false);
                  router.push("/signup");
                }}
              >
                {t('navigation.getStarted')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
