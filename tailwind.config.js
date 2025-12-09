/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    screens: {
      'xs': '375px',     // Small phones
      'sm': '640px',     // Phones landscape / small tablets
      'md': '768px',     // Tablets
      'lg': '1024px',    // Laptops
      'xl': '1280px',    // Desktops
      '2xl': '1536px',   // Large desktops
    },
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
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      boxShadow: {
        'soft': '0 20px 60px -30px rgba(76, 110, 245, 0.35)',
        'glow': '0 0 25px rgba(34, 184, 207, 0.45)',
        'card': '0 8px 30px rgba(15, 23, 42, 0.08)',
        'elevated': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      },
      spacing: {
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)',
      },
      minHeight: {
        'touch': '44px',
        'touch-lg': '48px',
      },
      minWidth: {
        'touch': '44px',
        'touch-lg': '48px',
      },
      fontSize: {
        'xxs': ['0.625rem', { lineHeight: '0.875rem' }],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(100%)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(99, 102, 241, 0.4)' },
          '50%': { boxShadow: '0 0 40px rgba(99, 102, 241, 0.6)' },
        },
      },
    }
  },
  plugins: [],
}
