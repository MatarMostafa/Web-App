"use client";
import { useEffect } from 'react';
import { useLanguageStore } from '@/store/languageStore';
import { useTranslation } from '@/hooks/useTranslation';

interface LanguageProviderProps {
  children: React.ReactNode;
}

export default function LanguageProvider({ children }: LanguageProviderProps) {
  const { language, detectLanguageFromIP } = useLanguageStore();
  const { i18n } = useTranslation();

  useEffect(() => {
    detectLanguageFromIP();
    if (i18n.language !== language) {
      i18n.changeLanguage(language);
    }
  }, [language, detectLanguageFromIP, i18n]);

  return <>{children}</>;
}