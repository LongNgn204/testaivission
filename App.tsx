/**
 * Sức Khỏe AI - AI-Powered Vision Testing Platform
 * 
 * Main application component with routing and context providers
 * 
 * Features:
 * - 5 Vision Tests (Snellen, Color Blind, Astigmatism, Amsler, Duochrome)
 * - AI Chatbot (2-way voice conversation)
 * - Progress Tracking (charts + AI insights)
 * - Hospital Locator (GPS-based)
 * - Gamification (badges, streaks, exercises)
 * - Smart Reminders (notifications)
 * 
 * Tech Stack: React 19, TypeScript, Google Gemini AI, Web Speech API
 */

import React, { lazy, Suspense, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { RoutineProvider } from './context/RoutineContext';
import { ThemeProvider } from './context/ThemeContext';
import { Header } from './components/Header';
import { initializeReminderSystem } from './services/reminderService';
import { initPerformanceOptimizations } from './utils/performanceUtils';

// ⚡ LAZY LOADING: Load components only when needed (HUGE speed boost!)
const Home = lazy(() => import('./pages/Home').then(m => ({ default: m.Home })));
const History = lazy(() => import('./pages/History').then(m => ({ default: m.History })));
const AboutPage = lazy(() => import('./pages/AboutPage').then(m => ({ default: m.AboutPage })));
const PersonalizedSetupPage = lazy(() => import('./pages/PersonalizedSetupPage').then(m => ({ default: m.PersonalizedSetupPage })));
const WelcomePage = lazy(() => import('./pages/WelcomePage').then(m => ({ default: m.WelcomePage })));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const SnellenTest = lazy(() => import('./components/SnellenTest').then(m => ({ default: m.SnellenTest })));
const ColorBlindTest = lazy(() => import('./components/ColorBlindTest').then(m => ({ default: m.ColorBlindTest })));
const AstigmatismTest = lazy(() => import('./components/AstigmatismTest').then(m => ({ default: m.AstigmatismTest })));
const AmslerGridTest = lazy(() => import('./components/AmslerGridTest').then(m => ({ default: m.AmslerGridTest })));
const DuochromeTest = lazy(() => import('./components/DuochromeTest').then(m => ({ default: m.DuochromeTest })));
const HospitalLocator = lazy(() => import('./components/HospitalLocator'));
const RemindersPage = lazy(() => import('./pages/RemindersPage'));
const ProgressPage = lazy(() => import('./pages/ProgressPage'));
const VisionCoach = lazy(() => import('./components/VisionCoach').then(m => ({ default: m.VisionCoach })));
const VoiceCommandButton = lazy(() => import('./components/VoiceCommandButton').then(m => ({ default: m.VoiceCommandButton })));
const TestInstructionsPlayer = lazy(() => import('./components/TestInstructionsPlayer').then(m => ({ default: m.TestInstructionsPlayer })));

// ⚡ LOADING FALLBACK: Fast, minimal loading UI
const LoadingFallback: React.FC = () => (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 dark:border-indigo-400"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-300 font-medium">Đang tải...</p>
        </div>
    </div>
);

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const userData = localStorage.getItem('user_data');
    
    if (!userData) {
        return <Navigate to="/login" replace />;
    }
    
    return <>{children}</>;
};

const MainAppLayout: React.FC = () => {
    const { t } = useLanguage();

    React.useEffect(() => {
        // ⚡ PERFORMANCE: Initialize optimizations
        initPerformanceOptimizations();
        initializeReminderSystem();
    }, []);

    return (
        <div className="min-h-screen font-sans relative flex flex-col">
            <Header />
            <Suspense fallback={<div className="h-16" />}>
                <TestInstructionsPlayer />
            </Suspense>
            <main className="flex-grow">
                <Suspense fallback={<LoadingFallback />}>
                    <Routes>
                        <Route index element={<Home />} />
                        <Route path="history" element={<History />} />
                        <Route path="about" element={<AboutPage />} />
                        <Route path="test/snellen" element={<SnellenTest />} />
                        <Route path="test/colorblind" element={<ColorBlindTest />} />
                        <Route path="test/astigmatism" element={<AstigmatismTest />} />
                        <Route path="test/amsler" element={<AmslerGridTest />} />
                        <Route path="test/duochrome" element={<DuochromeTest />} />
                        <Route path="hospitals" element={<HospitalLocator />} />
                        <Route path="reminders" element={<RemindersPage />} />
                        <Route path="progress" element={<ProgressPage />} />
                        <Route path="*" element={<Navigate to="/home" replace />} />
                    </Routes>
                </Suspense>
            </main>
            
            <footer className="bg-white border-t dark:bg-gray-900 dark:border-gray-800">
                <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 text-center text-gray-500 dark:text-gray-400">
                    <p>{t('footer_copyright')}</p>
                    <p className="text-xs mt-2">{t('footer_disclaimer')}</p>
                </div>
            </footer>
            <Suspense fallback={<div />}>
                <VisionCoach />
                <VoiceCommandButton />
            </Suspense>
        </div>
    );
}

const AppContent: React.FC = () => {
    const [isLoggedIn, setIsLoggedIn] = React.useState(() => {
        // Initialize from localStorage
        return !!localStorage.getItem('user_data');
    });

    // Check if user is logged in (re-check on route changes)
    React.useEffect(() => {
        const checkLoginStatus = () => {
            const userData = localStorage.getItem('user_data');
            setIsLoggedIn(!!userData);
        };

        // Check initially
        checkLoginStatus();

        // Listen for custom login event
        const handleLoginChange = () => {
            checkLoginStatus();
        };

        window.addEventListener('userLoggedIn', handleLoginChange);
        window.addEventListener('userLoggedOut', handleLoginChange);
        
        return () => {
            window.removeEventListener('userLoggedIn', handleLoginChange);
            window.removeEventListener('userLoggedOut', handleLoginChange);
        };
    }, []);

    // Listen for storage changes (logout from another tab/component)
    React.useEffect(() => {
        const handleStorageChange = () => {
            const userData = localStorage.getItem('user_data');
            if (!userData) {
                setIsLoggedIn(false);
            } else {
                setIsLoggedIn(true);
            }
        };
        
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    return (
        <HashRouter>
            <Suspense fallback={<LoadingFallback />}>
                <Routes>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/setup" element={<PersonalizedSetupPage />} />
                    <Route path="/home/*" element={<MainAppLayout />} />
                    {/* Always show WelcomePage at root */}
                    <Route path="/" element={<WelcomePage />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </Suspense>
        </HashRouter>
    );
};

export default function App() {
  return (
    <ThemeProvider>
        <LanguageProvider>
            <RoutineProvider>
                <AppContent />
            </RoutineProvider>
        </LanguageProvider>
    </ThemeProvider>
  );
}
