"use client";
import Image from "next/image";
import Link from "next/link";
import { LayoutGrid, Users, BarChart3, HelpCircle } from "lucide-react";

interface FooterSection {
  title: string;
  links: Array<{
    label: string;
    href: string;
    icon?: React.ReactNode;
  }>;
}

const footerSections: FooterSection[] = [
  {
    title: "Product",
    links: [
      {
        label: "Dashboard",
        href: "/dashboard",
        icon: <LayoutGrid className="w-4 h-4" />,
      },
      {
        label: "Employee Management",
        href: "/employees",
        icon: <Users className="w-4 h-4" />,
      },
      {
        label: "Performance",
        href: "/performance",
        icon: <BarChart3 className="w-4 h-4" />,
      },
      {
        label: "Support",
        href: "/support",
        icon: <HelpCircle className="w-4 h-4" />,
      },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Documentation", href: "/docs" },
      { label: "API Reference", href: "/api-docs" },
      { label: "Community", href: "/community" },
      { label: "Blog", href: "/blog" },
    ],
  },
];

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-center items-center">
          {/* Contact Info */}
          <div className="space-y-4  text-center">
            <h3 className="text-lg font-semibold text-white">Contact</h3>
            <div className="space-y-3">
              <p className="flex items-center">
                <Image
                  src="/assets/footer/email.svg"
                  alt="Email"
                  width={20}
                  height={20}
                  className="mr-2"
                />
                support@erp-beta.com
              </p>
              <p className="flex items-center">
                <Image
                  src="/assets/footer/telephone.svg"
                  alt="Phone"
                  width={20}
                  height={20}
                  className="mr-2"
                />
                +1 (555) 123-4567
              </p>
              <p className="flex items-center">
                <Image
                  src="/assets/footer/mask.svg"
                  alt="Location"
                  width={20}
                  height={20}
                  className="mr-2"
                />
                123 Business Ave, Suite 100
                <br />
                San Francisco, CA 94107
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm">
              © {new Date().getFullYear()} ERP Beta. All rights reserved.
            </p>
            <div className="flex space-x-6 text-sm">
              <Link href="/privacy" className="hover:text-blue-400">
                Privacy Policy
              </Link>
              <Link href="/terms" className="hover:text-blue-400">
                Terms of Service
              </Link>
              <Link href="/security" className="hover:text-blue-400">
                Security
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
