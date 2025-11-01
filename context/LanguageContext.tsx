
import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';
import { translations } from '../i18n';

type Language = 'vi' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  // Fix: Update `t` function signature to accept an optional replacements object.
  t: (key: keyof typeof translations.vi, replacements?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem('language') as Language) || 'vi';
  });

  const setLanguage = (lang: Language) => {
    localStorage.setItem('language', lang);
    setLanguageState(lang);
  };

  // Fix: Update `t` function implementation to handle replacements.
  const t = useCallback((key: keyof typeof translations.vi, replacements?: Record<string, string | number>): string => {
    let translation = translations[language][key] || translations['en'][key] || key;
    if (replacements) {
        Object.keys(replacements).forEach(replaceKey => {
            const regex = new RegExp(`\\{${replaceKey}\\}`, 'g');
            translation = translation.replace(regex, String(replacements[replaceKey]));
        });
    }
    return translation;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
