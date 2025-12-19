"use client";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "react-hot-toast";
import { I18nextProvider } from 'react-i18next';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageProvider from '@/components/LanguageProvider';
import enTranslations from '../../public/locales/en/common.json';
import deTranslations from '../../public/locales/de/common.json';

i18n.use(initReactI18next).init({
  lng: 'de',
  fallbackLng: 'en',
  resources: {
    en: { translation: enTranslations },
    de: { translation: deTranslations }
  },
  interpolation: { escapeValue: false }
});

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <I18nextProvider i18n={i18n}>
        <LanguageProvider>
          {children}
          <Toaster position="top-right" />
        </LanguageProvider>
      </I18nextProvider>
    </SessionProvider>
  );
}