/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // MÀU CHỦ ĐẠO (Thư giãn & Tin cậy)
        primary: {
          DEFAULT: '#059669', // Emerald 600 (Nút chính, Icon)
          hover: '#047857',   // Emerald 700
          light: '#d1fae5',   // Emerald 100 (Nền icon)
        },
        secondary: {
          DEFAULT: '#0ea5e9', // Sky 500 (Accent cho công nghệ/AI)
          light: '#e0f2fe',
        },
        // MÀU NỀN (Chống mỏi mắt)
        background: {
          light: '#f0fdf4',   // Mint 50 (Thay cho gray-50) - Cực dịu
          dark: '#022c22',    // Jungle 950 (Thay cho gray-900) - Sâu thẳm
        },
        surface: {
          light: '#ffffff',   // Card nổi bật trên nền Mint
          dark: '#064e3b',    // Emerald 900
        },
        // MÀU CHỮ (Tương phản tốt nhưng không gắt)
        text: {
          main: '#064e3b',    // Emerald 900 (Thay cho đen)
          sub: '#334155',     // Slate 700
          dark: '#ecfdf5',    // Emerald 50 (Cho dark mode)
        }
      },
      borderRadius: {
        '3xl': '1.5rem', // Bo góc lớn hơn cho cảm giác mềm mại
      },
      boxShadow: {
        'soft': '0 10px 40px -10px rgba(5, 150, 105, 0.1)', // Bóng mờ màu xanh
        'glow': '0 0 20px rgba(14, 165, 233, 0.3)', // Glow cho AI
      }
    }
  },
  plugins: [],
}