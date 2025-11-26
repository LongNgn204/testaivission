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
        primary: {
          DEFAULT: '#4C6EF5',
          light: '#748FFC',
          dark: '#364FC7',
          muted: '#EDF2FF'
        },
        secondary: {
          DEFAULT: '#22B8CF',
          light: '#C5F6FA',
          dark: '#0B7285'
        },
        accent: {
          DEFAULT: '#FFD43B',
          light: '#FFE066',
          dark: '#F08C00'
        },
        background: {
          light: '#F5F7FB',
          dark: '#0F172A'
        },
        surface: {
          light: '#FFFFFF',
          dark: '#1F2937'
        },
        text: {
          main: '#0F172A',
          sub: '#475569',
          dark: '#F8FAFC'
        }
      },
      borderRadius: {
        '3xl': '1.5rem', // Bo góc lớn hơn cho cảm giác mềm mại
      },
      boxShadow: {
        'soft': '0 20px 60px -30px rgba(76, 110, 245, 0.35)',
        'glow': '0 0 25px rgba(34, 184, 207, 0.45)',
        'card': '0 8px 30px rgba(15, 23, 42, 0.08)'
      }
    }
  },
  plugins: [],
}