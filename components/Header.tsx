import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, History, Info, Menu, Sun, Moon, MapPin, Bell, TrendingUp, X } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { UserInfo } from './UserInfo';
import { VoiceControlButton } from './VoiceControlButton';
import logo from '../assets/logo.png';

export const Header: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();
  const { theme, setTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const navItems = [
    { to: "/home", icon: Home, label: t('nav_home') },
    { to: "/home/history", icon: History, label: t('nav_history') },
    { to: "/home/progress", icon: TrendingUp, label: t('nav_progress') },
    { to: "/home/hospitals", icon: MapPin, label: t('nav_hospitals') },
    { to: "/home/reminders", icon: Bell, label: t('nav_reminders') },
    { to: "/home/about", icon: Info, label: t('nav_about') },
  ];

  return (
    <header className="glass backdrop-blur-md border-b border-primary-light/30 shadow-soft sticky top-0 z-30 dark:border-surface-dark/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo and App Name */}
          <div className="flex-shrink-0">
            <NavLink to="/home" className="flex items-center gap-3">
              <img src={logo} alt="Logo" className="h-10 w-auto drop-shadow-md" />
              <span className="text-base font-bold text-gray-800 hidden lg:flex lg:flex-col dark:text-gray-200 leading-tight">
                <span>{t('appName_line1')}</span>
                <span>{t('appName_line2')}</span>
              </span>
            </NavLink>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex md:items-center md:gap-2">
            {navItems.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/home"}
                className={({ isActive }) =>
                  `px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-sm ${isActive ? 'bg-primary-light text-primary shadow-inner dark:bg-primary/20 dark:text-primary-light' : 'text-text-sub hover:bg-primary-light/50 hover:text-primary hover:shadow-soft dark:text-text-dark dark:hover:bg-primary/10 dark:hover:shadow-soft'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
            {/* Language Switcher - Desktop */}
            <div className="flex items-center border-l ml-4 pl-4 border-primary-light/30 dark:border-surface-dark/50">
              <button
                onClick={() => setLanguage('vi')}
                className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${language === 'vi' ? 'bg-primary text-white shadow-inner' : 'bg-surface-light text-text-sub hover:bg-primary-light dark:bg-surface-dark dark:text-text-dark dark:hover:bg-primary/20'}`}
              >
                VI
              </button>
              <button
                onClick={() => setLanguage('en')}
                className={`ml-2 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${language === 'en' ? 'bg-primary text-white shadow-inner' : 'bg-surface-light text-text-sub hover:bg-primary-light dark:bg-surface-dark dark:text-text-dark dark:hover:bg-primary/20'}`}
              >
                EN
              </button>
            </div>
            {/* Theme Switcher - Desktop */}
            <div className="flex items-center border-l ml-4 pl-4 dark:border-gray-700">
              <div className="flex items-center gap-1 p-1 rounded-lg bg-surface-light dark:bg-surface-dark">
                <button
                  onClick={() => setTheme('light')}
                  className={`p-1.5 rounded-md transition-colors ${theme === 'light' ? 'bg-primary-light text-primary shadow-sm' : 'text-text-sub hover:bg-primary-light/50 dark:text-text-dark dark:hover:bg-primary/20'}`}
                  aria-label="Light mode"
                >
                  <Sun size={18} />
                </button>
                <button
                  onClick={() => setTheme('dark')}
                  className={`p-1.5 rounded-md transition-colors ${theme === 'dark' ? 'bg-primary-light text-primary shadow-sm' : 'text-text-sub hover:bg-primary-light/50 dark:text-text-dark dark:hover:bg-primary/20'}`}
                  aria-label="Dark mode"
                >
                  <Moon size={18} />
                </button>
              </div>
            </div>
            {/* Voice Control - Desktop */}
            <div className="ml-4">
              <VoiceControlButton />
            </div>
            {/* User Info - Desktop */}
            <div className="ml-4">
              <UserInfo showLoginButton />
            </div>
          </nav>

          {/* Mobile: User Info & Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <UserInfo showLoginButton />
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 dark:text-gray-300 hover:text-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none"
              aria-label="Open main menu"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden glass border-t border-primary-light/30 dark:border-surface-dark/50 absolute w-full left-0 top-20 shadow-lg animate-fade-in-down">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navItems.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/home"}
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-3 rounded-md text-base font-medium ${isActive ? 'bg-primary-light text-primary dark:bg-primary/20 dark:text-primary-light' : 'text-text-sub hover:bg-primary-light/50 hover:text-primary dark:text-text-dark dark:hover:bg-primary/10'
                  }`
                }
              >
                <item.icon size={20} />
                {item.label}
              </NavLink>
            ))}

            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 pb-2">
              <div className="flex items-center justify-between px-4">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Language</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setLanguage('vi')}
                    className={`px-3 py-1 rounded text-sm ${language === 'vi' ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-gray-800'}`}
                  >VI</button>
                  <button
                    onClick={() => setLanguage('en')}
                    className={`px-3 py-1 rounded text-sm ${language === 'en' ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-gray-800'}`}
                  >EN</button>
                </div>
              </div>
              <div className="flex items-center justify-between px-4 mt-3">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Theme</span>
                <div className="flex gap-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
                  <button onClick={() => setTheme('light')} className={`p-1.5 rounded ${theme === 'light' ? 'bg-white shadow text-primary' : 'text-gray-500'}`}><Sun size={18} /></button>
                  <button onClick={() => setTheme('dark')} className={`p-1.5 rounded ${theme === 'dark' ? 'bg-gray-700 shadow text-primary' : 'text-gray-500'}`}><Moon size={18} /></button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};