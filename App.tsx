/**
 * ========================================
 * Sức Khỏe AI - AI-Powered Vision Testing Platform
 * ========================================
 *
 * MỤC ĐÍCH CHÍNH:
 * - Ứng dụng kiểm tra thị lực toàn diện với AI hỗ trợ
 * - Cung cấp 5 bài kiểm tra thị lực tiêu chuẩn
 * - Tích hợp chatbot AI 2 chiều (voice + text)
 * - Theo dõi tiến độ và đưa ra khuyến nghị
 *
 * ✨ TÍNH NĂNG CHÍNH:
 * - 5 Vision Tests (Snellen, Color Blind, Astigmatism, Amsler, Duochrome)
 * - AI Chatbot (2-way voice conversation)
 * - Progress Tracking (charts + AI insights)
 * - Hospital Locator (GPS-based)
 * - Gamification (badges, streaks, exercises)
 * - React 19 + TypeScript
 * - Google Gemini AI API
 * - Web Speech API (voice)
 * - LocalStorage (offline data)
 * - Tailwind CSS + Dark Mode
 *
 * 🔐 LUỒNG XÁC THỰC:
 * 1. Người dùng truy cập → WelcomePage
 * 2. Đăng nhập (LoginPage) → lưu user_data vào localStorage
 * 3. Setup cá nhân (PersonalizedSetupPage) → lưu routine + answers
 * 4. Truy cập các bài test (ProtectedRoute)
 * 5. Xem lịch sử + báo cáo (History, ProgressPage)
 */

import React, { lazy, Suspense } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { RoutineProvider } from './context/RoutineContext';
import { ThemeProvider } from './context/ThemeContext';
import { VoiceControlProvider } from './context/VoiceControlContext';
import { Header } from './components/Header';
import { ProtectedRoute } from './components/ProtectedRoute';
import { initializeReminderSystem } from './services/reminderService';
import { initPerformanceOptimizations } from './utils/performanceUtils';

// ⚡ LAZY LOADING (Tải các component khi cần):
// - Giảm bundle size ban đầu
// - Tăng tốc độ load trang
// - Cải thiện performance trên mobile
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
const TestInstructionsPlayer = lazy(() => import('./components/TestInstructionsPlayer').then(m => ({ default: m.TestInstructionsPlayer })));

/**
 * ⚡ LOADING FALLBACK: UI tải nhanh, tối giản
 * - Hiển thị spinner + text "Đang tải..."
 * - Áp dụng theme (light/dark)
 * - Không block UI chính
 */
const LoadingFallback: React.FC = () => (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 dark:border-indigo-400"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-300 font-medium">Đang tải...</p>
        </div>
    </div>
);

/**
 * 🏠 MAIN APP LAYOUT: Layout chính sau khi đăng nhập
 *
 * CẤU TRÚC:
 * - Header: Navigation + user info
 * - TestInstructionsPlayer: Hướng dẫn bài test (nếu có)
 * - Main Routes: Các trang chính (Home, History, Tests, etc.)
 * - Footer: Copyright + disclaimer
 * - VisionCoach: AI chatbot (always available)
 *
 * LIFECYCLE:
 * 1. Mount → khởi tạo performance optimizations + reminder system
 * 2. Render → hiển thị header + routes + footer
 * 3. Unmount → cleanup (nếu cần)
 */
const MainAppLayout: React.FC = () => {
    const { t } = useLanguage();

    React.useEffect(() => {
        // ⚡ PERFORMANCE: Khởi tạo tối ưu hóa
        initPerformanceOptimizations();
        // 🔔 REMINDERS: Khởi tạo hệ thống nhắc nhở
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
            </Suspense>
        </div>
    );
}

/**
 * 🔐 APP CONTENT: Xử lý xác thực + routing chính
 *
 * LUỒNG XÁC THỰC:
 * 1. checking: Đang kiểm tra trạng thái đăng nhập
 * 2. guest: Chưa đăng nhập → hiển thị WelcomePage + LoginPage
 * 3. authenticated: Đã đăng nhập → hiển thị MainAppLayout
 *
 * EVENTS THEO DÕI:
 * - userLoggedIn: Người dùng đăng nhập thành công
 * - userLoggedOut: Người dùng đăng xuất
 * - storage: localStorage thay đổi (multi-tab sync)
 *
 * ROUTES:
 * - /: WelcomePage (public)
 * - /login: LoginPage (public)
 * - /setup: PersonalizedSetupPage (protected)
 * - /home/*: MainAppLayout (protected)
 */
const AppContent: React.FC = () => {
    const [authState, setAuthState] = React.useState<'checking' | 'guest' | 'authenticated'>('checking');

    const syncAuthState = React.useCallback(() => {
        try {
            const userData = localStorage.getItem('user_data');
            setAuthState(userData ? 'authenticated' : 'guest');
        } catch (error) {
            console.error('Failed to read auth state', error);
            setAuthState('guest');
        }
    }, []);

    React.useEffect(() => {
        syncAuthState();

        const handleAuthEvent = () => syncAuthState();

        window.addEventListener('userLoggedIn', handleAuthEvent);
        window.addEventListener('userLoggedOut', handleAuthEvent);
        window.addEventListener('storage', handleAuthEvent);

        return () => {
            window.removeEventListener('userLoggedIn', handleAuthEvent);
            window.removeEventListener('userLoggedOut', handleAuthEvent);
            window.removeEventListener('storage', handleAuthEvent);
        };
    }, [syncAuthState]);

    if (authState === 'checking') {
        return <LoadingFallback />;
    }

    const isLoggedIn = authState === 'authenticated';

    return (
        <HashRouter>
            <Suspense fallback={<LoadingFallback />}>
                <Routes>
                    <Route
                        path="/login"
                        element={isLoggedIn ? <Navigate to="/home" replace /> : <LoginPage />}
                    />
                    <Route
                        path="/setup"
                        element={
                            <ProtectedRoute isAuthenticated={isLoggedIn}>
                                <PersonalizedSetupPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/home/*"
                        element={
                            <ProtectedRoute isAuthenticated={isLoggedIn}>
                                <MainAppLayout />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/"
                        element={isLoggedIn ? <Navigate to="/home" replace /> : <WelcomePage />}
                    />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </Suspense>
        </HashRouter>
    );
};

/**
 * 📦 APP PROVIDERS: Bọc toàn bộ ứng dụng với các Context Provider
 *
 * THỨ TỰ QUAN TRỌNG:
 * 1. ThemeProvider: Cung cấp theme (light/dark) cho toàn bộ app
 * 2. LanguageProvider: Cung cấp ngôn ngữ (vi/en)
 * 3. RoutineProvider: Quản lý lịch trình và trạng thái setup
 */
export default function App() {
    return (
        <ThemeProvider>
            <LanguageProvider>
                <RoutineProvider>
                    <VoiceControlProvider>
                        <AppContent />
                    </VoiceControlProvider>
                </RoutineProvider>
            </LanguageProvider>
        </ThemeProvider>
    );
}
