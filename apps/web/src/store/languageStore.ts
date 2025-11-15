import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import i18n from 'i18next';

interface LanguageState {
  language: string;
  setLanguage: (language: string) => void;
  detectLanguageFromIP: () => Promise<void>;
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set, get) => ({
      language: 'en',
      setLanguage: (language: string) => {
        set({ language });
        i18n.changeLanguage(language);
      },
      detectLanguageFromIP: async () => {
        if (typeof window === 'undefined') return;
        const stored = localStorage.getItem('language-storage');
        if (stored) return;
        
        try {
          const response = await fetch('https://ipapi.co/json/');
          const data = await response.json();
          if (data.country_code === 'DE') {
            const newLang = 'de';
            set({ language: newLang });
            i18n.changeLanguage(newLang);
          }
        } catch (error) {
        }
      },
    }),
    {
      name: 'language-storage',
      storage: createJSONStorage(() => {
        if (typeof window !== 'undefined') {
          return localStorage;
        }
        return {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        };
      }),
    }
  )
);