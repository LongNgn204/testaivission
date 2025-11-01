
import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Home, History, Info, Eye, Menu, X, Sun, Moon, MapPin, Bell, TrendingUp } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { UserInfo } from './UserInfo';

export const Header: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();
  const { theme, setTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { to: "/home", icon: Home, label: t('nav_home') },
    { to: "/home/history", icon: History, label: t('nav_history') },
    { to: "/home/progress", icon: TrendingUp, label: t('nav_progress') },
    { to: "/home/hospitals", icon: MapPin, label: t('nav_hospitals') },
    { to: "/home/reminders", icon: Bell, label: t('nav_reminders') },
    { to: "/home/about", icon: Info, label: t('nav_about') },
  ];

  const handleLinkClick = () => {
      setIsMobileMenuOpen(false);
  }

  return (
    <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-30 dark:bg-gray-900/80 dark:border-b dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo and App Name */}
          <div className="flex-shrink-0">
            <NavLink to="/home" className="flex items-center gap-3">
              <Eye className="text-blue-600 flex-shrink-0" size={32} />
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
                  `px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                    isActive ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400' : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
            {/* Language Switcher - Desktop */}
            <div className="flex items-center border-l ml-4 pl-4 dark:border-gray-700">
              <button
                onClick={() => setLanguage('vi')}
                className={`px-3 py-1.5 rounded-md text-sm font-semibold ${language === 'vi' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'}`}
              >
                VI
              </button>
              <button
                onClick={() => setLanguage('en')}
                className={`ml-2 px-3 py-1.5 rounded-md text-sm font-semibold ${language === 'en' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'}`}
              >
                EN
              </button>
            </div>
             {/* Theme Switcher - Desktop */}
            <div className="flex items-center border-l ml-4 pl-4 dark:border-gray-700">
              <div className="flex items-center gap-1 p-1 rounded-lg bg-gray-200 dark:bg-gray-800">
                  <button onClick={() => setTheme('light')} className={`p-1.5 rounded-md ${theme === 'light' ? 'bg-white shadow-sm dark:bg-gray-700' : ''}`} aria-label="Light mode"><Sun size={18} className="text-gray-700 dark:text-gray-300" /></button>
                  <button onClick={() => setTheme('dark')} className={`p-1.5 rounded-md ${theme === 'dark' ? 'bg-white shadow-sm dark:bg-gray-700' : ''}`} aria-label="Dark mode"><Moon size={18} className="text-gray-700 dark:text-gray-300" /></button>
              </div>
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
              aria-controls="mobile-menu"
              aria-expanded={isMobileMenuOpen}
            >
              <span className="sr-only">Open main menu</span>
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t dark:border-gray-800" id="mobile-menu">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navItems.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/home"}
                onClick={handleLinkClick}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-md text-base font-medium transition-colors ${
                    isActive ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                  }`
                }
              >
                <item.icon size={20} />
                {item.label}
              </NavLink>
            ))}
          </div>
          {/* Language & Theme Switcher - Mobile */}
          <div className="pt-4 pb-3 border-t border-gray-200 dark:border-gray-800">
            <div className="px-5 space-y-4">
              <div className="flex items-center justify-center gap-4">
                 <button
                  onClick={() => { setLanguage('vi'); }}
                  className={`w-full py-2 rounded font-semibold text-sm transition-colors ${language === 'vi' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'}`}
                >
                  Tiếng Việt
                </button>
                <button
                  onClick={() => { setLanguage('en'); }}
                  className={`w-full py-2 rounded font-semibold text-sm transition-colors ${language === 'en' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'}`}
                >
                  English
                </button>
              </div>
              <div className="flex items-center gap-1 p-1 rounded-lg bg-gray-200 dark:bg-gray-800 w-full justify-around">
                  <button onClick={() => { setTheme('light'); handleLinkClick(); }} className={`p-2 rounded-md ${theme === 'light' ? 'bg-white shadow-sm dark:bg-gray-700' : ''}`} aria-label="Light mode"><Sun size={20} className="text-gray-700 dark:text-gray-300" /></button>
                  <button onClick={() => { setTheme('dark'); handleLinkClick(); }} className={`p-2 rounded-md ${theme === 'dark' ? 'bg-white shadow-sm dark:bg-gray-700' : ''}`} aria-label="Dark mode"><Moon size={20} className="text-gray-700 dark:text-gray-300" /></button>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};