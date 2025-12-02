<<<<<<< HEAD
import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, History, Info, Eye, Menu, X, Sun, Moon, MapPin, Bell, TrendingUp } from 'lucide-react';
=======
import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, History, Info, Menu, Sun, Moon, MapPin, Bell, TrendingUp, X } from 'lucide-react';
>>>>>>> cab493fd386716360f3fd4f7e7a23ccc7972d8e7
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { UserInfo } from './UserInfo';
import logo from '../assets/logo.png';

export const Header: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();
  const { theme, setTheme } = useTheme();
<<<<<<< HEAD
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
=======
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
>>>>>>> cab493fd386716360f3fd4f7e7a23ccc7972d8e7

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
<<<<<<< HEAD
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
=======
        <div className="flex items-center justify-between h-20">
          {/* Logo and App Name */}
          <div className="flex-shrink-0">
            <NavLink to="/home" className="flex items-center gap-3">
              <img src={logo} alt="Logo" className="h-10 w-auto drop-shadow-md" />
              <span className="text-base font-bold text-gray-800 hidden lg:flex lg:flex-col dark:text-gray-200 leading-tight">
                <span>{t('appName_line1')}</span>
                <span>{t('appName_line2')}</span>
>>>>>>> cab493fd386716360f3fd4f7e7a23ccc7972d8e7
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
<<<<<<< HEAD
                  `flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${isActive
                    ? 'bg-primary-500 text-white shadow-md transform scale-105'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-white/80 dark:hover:bg-slate-700 hover:text-primary-600 dark:hover:text-primary-400'
=======
                  `px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-sm ${isActive ? 'bg-primary-light text-primary shadow-inner dark:bg-primary/20 dark:text-primary-light' : 'text-text-sub hover:bg-primary-light/50 hover:text-primary hover:shadow-soft dark:text-text-dark dark:hover:bg-primary/10 dark:hover:shadow-soft'
>>>>>>> cab493fd386716360f3fd4f7e7a23ccc7972d8e7
                  }`
                }
              >
                <item.icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            ))}
<<<<<<< HEAD
=======
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
            {/* User Info - Desktop */}
            <div className="ml-4">
              <UserInfo showLoginButton />
            </div>
>>>>>>> cab493fd386716360f3fd4f7e7a23ccc7972d8e7
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
<<<<<<< HEAD
              className="p-2 rounded-xl bg-white/50 dark:bg-slate-800/50 text-gray-700 dark:text-gray-200 shadow-sm border border-white/20 dark:border-white/10 min-h-[44px] min-w-[44px]"
              aria-label={isMobileMenuOpen ? (language === 'vi' ? 'Đóng menu' : 'Close menu') : (language === 'vi' ? 'Mở menu' : 'Open menu')}
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-menu"
=======
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 dark:text-gray-300 hover:text-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none"
              aria-label="Open main menu"
>>>>>>> cab493fd386716360f3fd4f7e7a23ccc7972d8e7
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

<<<<<<< HEAD
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
=======
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
>>>>>>> cab493fd386716360f3fd4f7e7a23ccc7972d8e7
          </div>
        </div>
      </div>
    </header>
  );
};