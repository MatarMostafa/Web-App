"use client";
import React from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { useLanguageStore } from '@/store/languageStore';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui';
import { Globe } from 'lucide-react';

const LanguageSwitcher = () => {
  const { t } = useTranslation();
  const { language, setLanguage } = useLanguageStore();

  return (
    <Select value={language} onValueChange={setLanguage}>
      <SelectTrigger className="w-[120px] border-none bg-transparent">
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4" />
          <SelectValue />
        </div>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="en">{t('language.english')}</SelectItem>
        <SelectItem value="de">{t('language.german')}</SelectItem>
      </SelectContent>
    </Select>
  );
};

export default LanguageSwitcher;