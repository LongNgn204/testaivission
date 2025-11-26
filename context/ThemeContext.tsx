/**
 * =================================================================
 * 🎨 ThemeContext - Quản lý giao diện (Sáng/Tối/Hệ thống)
 * =================================================================
 *
 * MỤC ĐÍCH:
 * - Cung cấp và điều khiển theme (giao diện) cho toàn bộ ứng dụng.
 * - Hỗ trợ 3 chế độ: 'light' (sáng), 'dark' (tối), và 'system' (theo hệ thống).
 * - Tự động áp dụng class 'dark' hoặc 'light' vào thẻ <html>.
 * - Lưu lựa chọn theme của người dùng vào localStorage.
 * - Tự động thay đổi theme khi cài đặt hệ thống thay đổi (nếu đang ở chế độ 'system').
 *
 * CÁCH SỬ DỤNG:
 * - Bọc `ThemeProvider` quanh `App`.
 * - Trong component, dùng `const { theme, setTheme } = useTheme();`
 */
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';

// Định nghĩa các loại theme được hỗ trợ
type Theme = 'light' | 'dark' | 'system';

// Định nghĩa cấu trúc của Context
interface ThemeContextType {
  theme: Theme; // Theme hiện tại
  setTheme: (theme: Theme) => void; // Hàm để thay đổi theme
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // State quản lý theme, khởi tạo từ localStorage hoặc mặc định là 'system'
  const [theme, setTheme] = useState<Theme>(() => {
    return (localStorage.getItem('theme') as Theme) || 'system';
  });

  // Effect này chạy mỗi khi `theme` thay đổi
  useEffect(() => {
    const root = window.document.documentElement; // Lấy thẻ <html>

    // Xác định xem có nên bật dark mode không
    const isDark =
      theme === 'dark' ||
      (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    // Xóa class cũ và thêm class mới vào <html>
    root.classList.remove(isDark ? 'light' : 'dark');
    root.classList.add(isDark ? 'dark' : 'light');

    // Lưu lựa chọn của người dùng vào localStorage
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Effect này lắng nghe sự thay đổi theme của hệ thống
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    // Hàm xử lý khi theme hệ thống thay đổi
    const handleChange = () => {
      // Chỉ cập nhật nếu người dùng đang chọn chế độ 'system'
      if (theme === 'system') {
        const root = window.document.documentElement;
        root.classList.remove('light', 'dark');
        root.classList.add(mediaQuery.matches ? 'dark' : 'light');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange); // Cleanup
  }, [theme]); // Chạy lại nếu `theme` thay đổi (để gắn/gỡ listener đúng lúc)

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

/**
 * Hook `useTheme` để dễ dàng sử dụng context
 */
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
