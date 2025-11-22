import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { UserInfo } from './UserInfo';
import {
  HomeIcon,
  HistoryIcon,
  ChartIcon,
  MapIcon,
  BellIcon,
  InfoIcon,
  EyeIcon,
  MenuIcon,
  XIcon,
  SunIcon,
  MoonIcon
} from './ui/Icons';

export const Header: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();
  const { theme, setTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { to: "/home", icon: HomeIcon, label: t('nav_home') },
    { to: "/home/history", icon: HistoryIcon, label: t('nav_history') },
    { to: "/home/progress", icon: ChartIcon, label: t('nav_progress') },
    { to: "/home/hospitals", icon: MapIcon, label: t('nav_hospitals') },
    { to: "/home/reminders", icon: BellIcon, label: t('nav_reminders') },
    { to: "/home/about", icon: InfoIcon, label: t('nav_about') },
  ];

  const handleLinkClick = () => {
    setIsMobileMenuOpen(false);
  }

  return (
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 transition-colors duration-300">
      <div className="container mx-auto">
        <div className="flex items-center justify-between h-20">
          {/* Logo and App Name */}
          <div className="flex-shrink-0">
            <NavLink to="/home" className="flex items-center gap-3 no-underline">
              <div className="p-1.5 bg-blue-50 dark:bg-blue-900/30 rounded-xl">
                <EyeIcon className="text-primary" size={32} />
              </div>
              <span className="flex flex-col leading-tight">
                <span className="text-sm font-bold text-primary tracking-wide uppercase">{t('appName_line1')}</span>
                <span className="text-lg font-bold text-gray-900 dark:text-white">{t('appName_line2')}</span>
              </span>
            </NavLink>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex md:items-center md:gap-1">
            {navItems.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/home"}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isActive
                    ? 'bg-blue-50 text-primary dark:bg-blue-900/30 dark:text-blue-400'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-primary dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-blue-400'
                  }`
                }
              >
                <item.icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            ))}

            <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 mx-3"></div>

            {/* Language Switcher - Desktop */}
            <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
              <button
                onClick={() => setLanguage('vi')}
                className={`px-2 py-1 rounded-md text-xs font-bold transition-all ${language === 'vi' ? 'bg-white text-primary shadow-sm dark:bg-gray-700 dark:text-white' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
              >
                VI
              </button>
              <button
                onClick={() => setLanguage('en')}
                className={`px-2 py-1 rounded-md text-xs font-bold transition-all ${language === 'en' ? 'bg-white text-primary shadow-sm dark:bg-gray-700 dark:text-white' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
              >
                EN
              </button>
            </div>

            {/* Theme Switcher - Desktop */}
            <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-1 ml-2">
              <button
                onClick={() => setTheme('light')}
                className={`p-1.5 rounded-md transition-all ${theme === 'light' ? 'bg-white text-yellow-500 shadow-sm dark:bg-gray-700' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
                aria-label="Light mode"
              >
                <SunIcon size={16} />
              </button>
              <button
                onClick={() => setTheme('dark')}
                className={`p-1.5 rounded-md transition-all ${theme === 'dark' ? 'bg-white text-blue-400 shadow-sm dark:bg-gray-600 dark:text-blue-300' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
                aria-label="Dark mode"
              >
                <MoonIcon size={16} />
              </button>
            </div>

            {/* User Info - Desktop */}
            <div className="ml-3 pl-3 border-l border-gray-200 dark:border-gray-700">
              <UserInfo showLoginButton />
            </div>
          </nav>

          {/* Mobile: User Info & Menu Button */}
          <div className="md:hidden flex items-center gap-3">
            <UserInfo showLoginButton />
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
              aria-controls="mobile-menu"
              aria-expanded={isMobileMenuOpen}
            >
              <span className="sr-only">Open main menu</span>
              {isMobileMenuOpen ? <XIcon size={24} /> : <MenuIcon size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 animate-fade-in" id="mobile-menu">
          <div className="px-4 pt-4 pb-6 space-y-2">
            {navItems.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/home"}
                onClick={handleLinkClick}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-colors ${isActive
                    ? 'bg-blue-50 text-primary dark:bg-blue-900/30 dark:text-blue-400'
                    : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800'
                  }`
                }
              >
                <item.icon size={20} />
                {item.label}
              </NavLink>
            ))}

            <div className="h-px bg-gray-100 dark:bg-gray-800 my-4"></div>

            {/* Language & Theme Switcher - Mobile */}
            <div className="flex items-center justify-between gap-4 px-2">
              <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1 flex-1">
                <button
                  onClick={() => setLanguage('vi')}
                  className={`flex-1 py-2 rounded-md text-sm font-bold transition-all ${language === 'vi' ? 'bg-white text-primary shadow-sm dark:bg-gray-700' : 'text-gray-500 dark:text-gray-400'}`}
                >
                  Tiếng Việt
                </button>
                <button
                  onClick={() => setLanguage('en')}
                  className={`flex-1 py-2 rounded-md text-sm font-bold transition-all ${language === 'en' ? 'bg-white text-primary shadow-sm dark:bg-gray-700' : 'text-gray-500 dark:text-gray-400'}`}
                >
                  English
                </button>
              </div>

              <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                <button onClick={() => { setTheme('light'); handleLinkClick(); }} className={`p-2 rounded-md transition-all ${theme === 'light' ? 'bg-white text-yellow-500 shadow-sm dark:bg-gray-700' : 'text-gray-500 dark:text-gray-400'}`} aria-label="Light mode"><SunIcon size={20} /></button>
                <button onClick={() => { setTheme('dark'); handleLinkClick(); }} className={`p-2 rounded-md transition-all ${theme === 'dark' ? 'bg-white text-blue-400 shadow-sm dark:bg-gray-600' : 'text-gray-500 dark:text-gray-400'}`} aria-label="Dark mode"><MoonIcon size={20} /></button>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};