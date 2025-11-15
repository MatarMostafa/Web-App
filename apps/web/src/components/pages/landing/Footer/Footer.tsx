"use client";
import Image from "next/image";
import Link from "next/link";
import {
  LayoutGrid,
  Users,
  BarChart3,
  HelpCircle,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";
import { useTranslation } from '@/hooks/useTranslation';

interface FooterSection {
  title: string;
  links: Array<{
    label: string;
    href: string;
    icon?: React.ReactNode;
  }>;
}



const Footer = () => {
  const { t } = useTranslation();
  return (
    <footer className="bg-black text-gray-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-center items-center">
          {/* Contact Info */}
          <div className="space-y-4  text-center">
            <h3 className="text-lg font-semibold text-white">{t('landing.footer.contact')}</h3>
            <div className="space-y-3">
              <p className="flex items-center">
                <Mail className="mr-2" />
                support@erp-beta.com
              </p>
              <p className="flex items-center">
                <Phone className="mr-2" />
                +1 (555) 123-4567
              </p>
              <p className="flex items-center">
                <MapPin className="mr-2" />
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
              © {new Date().getFullYear()} ERP Beta. {t('landing.footer.allRightsReserved')}
            </p>
            <div className="flex space-x-6 text-sm">
              <Link href="/privacy" className="hover:text-gray-400">
                {t('landing.footer.privacyPolicy')}
              </Link>
              <Link href="/terms" className="hover:text-gray-400">
                {t('landing.footer.termsOfService')}
              </Link>
              <Link href="/security" className="hover:text-gray-400">
                {t('landing.footer.security')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
