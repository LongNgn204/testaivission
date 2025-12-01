import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, History, Info, Eye, Menu, X, Sun, Moon, MapPin, Bell, TrendingUp } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { UserInfo } from './UserInfo';

export const Header: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();
  const { theme, setTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const navItems = [
    { to: "/home", icon: Home, label: t('nav_home') },
    { to: "/home/history", icon: History, label: t('nav_history') },
    { to: "/home/progress", icon: TrendingUp, label: t('nav_progress') },
    { to: "/home/hospitals", icon: MapPin, label: t('nav_hospitals') },
    { to: "/home/reminders", icon: Bell, label: t('nav_reminders') },
    { to: "/home/about", icon: Info, label: t('nav_about') },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
          ? 'glass shadow-lg py-2'
          : 'bg-transparent py-4'
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <NavLink to="/home" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-primary-500 blur-lg opacity-20 group-hover:opacity-40 transition-opacity rounded-full"></div>
              <Eye className="text-primary-600 dark:text-primary-400 relative z-10 transition-transform group-hover:scale-110 duration-300" size={36} />
            </div>
            <div className="flex flex-col">
              <span className="font-display font-bold text-xl tracking-tight text-gray-900 dark:text-white leading-none">
                Vision<span className="text-primary-600 dark:text-primary-400">Coach</span>
              </span>
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400 tracking-wide">AI Eye Care</span>
            </div>
          </NavLink>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm px-2 py-1.5 rounded-2xl border border-white/20 dark:border-white/10 shadow-sm">
            {navItems.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/home"}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${isActive
                    ? 'bg-primary-500 text-white shadow-md transform scale-105'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-white/80 dark:hover:bg-slate-700 hover:text-primary-600 dark:hover:text-primary-400'
                  }`
                }
              >
                <item.icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="hidden md:flex items-center gap-4">
            {/* Theme Toggle */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2.5 rounded-xl bg-white/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-700 text-gray-600 dark:text-gray-300 transition-all duration-300 shadow-sm hover:shadow-md border border-white/20 dark:border-white/10"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={20} className="text-amber-400" /> : <Moon size={20} className="text-indigo-600" />}
            </button>

            {/* Language Toggle */}
            <button
              onClick={() => setLanguage(language === 'vi' ? 'en' : 'vi')}
              className="px-3 py-2 rounded-xl bg-white/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-700 text-sm font-bold text-primary-600 dark:text-primary-400 transition-all duration-300 shadow-sm hover:shadow-md border border-white/20 dark:border-white/10"
            >
              {language === 'vi' ? 'VN' : 'EN'}
            </button>

            <div className="h-8 w-px bg-gray-200 dark:bg-gray-700 mx-2"></div>

            <UserInfo showLoginButton />
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-3">
            <UserInfo showLoginButton />
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-xl bg-white/50 dark:bg-slate-800/50 text-gray-700 dark:text-gray-200 shadow-sm border border-white/20 dark:border-white/10 min-h-[44px] min-w-[44px]"
              aria-label={isMobileMenuOpen ? (language === 'vi' ? 'Đóng menu' : 'Close menu') : (language === 'vi' ? 'Mở menu' : 'Open menu')}
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-menu"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 z-40 bg-black/20 backdrop-blur-sm transition-opacity duration-300 md:hidden ${isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
        onClick={() => setIsMobileMenuOpen(false)}
      />

      {/* Mobile Menu Content */}
      <div
        className={`fixed top-[70px] right-4 w-64 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 transform transition-all duration-300 md:hidden z-50 overflow-hidden ${isMobileMenuOpen ? 'translate-y-0 opacity-100 scale-100' : '-translate-y-4 opacity-0 scale-95 pointer-events-none'
          }`}
      >
        <div className="p-2 space-y-1">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/home"}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive
                  ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800'
                }`
              }
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </NavLink>
          ))}

          <div className="my-2 border-t border-gray-100 dark:border-gray-800"></div>

          <div className="flex items-center justify-between px-4 py-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">{t('settings_theme')}</span>
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-lg bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>

          <div className="flex items-center justify-between px-4 py-2 pb-4">
            <span className="text-sm text-gray-500 dark:text-gray-400">{t('settings_language')}</span>
            <button
              onClick={() => setLanguage(language === 'vi' ? 'en' : 'vi')}
              className="px-3 py-1.5 rounded-lg bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 text-xs font-bold"
            >
              {language === 'vi' ? 'Tiếng Việt' : 'English'}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};