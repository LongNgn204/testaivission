/**
 * =================================================================
 * 🌐 LanguageContext - Quản lý ngôn ngữ (đa ngôn ngữ)
 * =================================================================
 *
 * MỤC ĐÍCH:
 * - Cung cấp trạng thái ngôn ngữ hiện tại (vi/en) cho toàn bộ ứng dụng.
 * - Cung cấp hàm `t` để dịch các chuỗi văn bản dựa trên key.
 * - Lưu và đọc ngôn ngữ ưu tiên của người dùng từ localStorage.
 *
 * CÁCH SỬ DỤNG:
 * - Bọc `LanguageProvider` quanh `App`.
 * - Trong component, dùng `const { t, language, setLanguage } = useLanguage();`
 * - `t('key_name')` để dịch.
 * - `t('key_with_variable', { name: 'User' })` để thay thế biến.
 */
import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';
import { translations } from '../i18n';

// Định nghĩa các ngôn ngữ được hỗ trợ
type Language = 'vi' | 'en';

// Định nghĩa cấu trúc của Context
interface LanguageContextType {
  language: Language; // Ngôn ngữ hiện tại
  setLanguage: (language: Language) => void; // Hàm thay đổi ngôn ngữ
  t: (key: keyof typeof translations.vi, replacements?: Record<string, string | number>) => string; // Hàm dịch
}

// Tạo LanguageContext
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

/**
 * LanguageProvider: Component cung cấp context
 */
export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // State quản lý ngôn ngữ, khởi tạo từ localStorage hoặc mặc định là 'vi'
  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem('language') as Language) || 'vi';
  });

  /**
   * Thay đổi ngôn ngữ và lưu vào localStorage
   * @param lang Ngôn ngữ mới ('vi' hoặc 'en')
   */
  const setLanguage = (lang: Language) => {
    localStorage.setItem('language', lang);
    setLanguageState(lang);
  };

  /**
   * Hàm dịch `t` (translation)
   * - Tìm bản dịch trong ngôn ngữ hiện tại.
   * - Nếu không có, fallback về tiếng Anh.
   * - Nếu vẫn không có, hiển thị key.
   * - Hỗ trợ thay thế biến (e.g., "Hello, {name}")
   */
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

/**
 * Hook `useLanguage` để dễ dàng sử dụng context
 */
export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
