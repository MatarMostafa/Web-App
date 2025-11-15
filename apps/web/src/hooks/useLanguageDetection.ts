"use client";
import { useEffect } from 'react';
import { useLanguageStore } from '@/store/languageStore';

export const useLanguageDetection = () => {
  const { detectLanguageFromIP } = useLanguageStore();

  useEffect(() => {
    detectLanguageFromIP();
  }, [detectLanguageFromIP]);
};