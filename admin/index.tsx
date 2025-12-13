/**
 * =================================================================
 * 🔐 Admin Dashboard - Main Entry Point
 * =================================================================
 * 
 * A complete standalone admin system for managing vision health records.
 * Features: Dashboard, Users, Records, Analytics, Settings
 */

import React, { useState, useEffect, createContext, useContext } from 'react';
import { AdminLogin } from './components/AdminLogin';
import { AdminLayout } from './components/AdminLayout';
import { DashboardPage } from './pages/DashboardPage';
import { RecordsPage } from './pages/RecordsPage';
import { UsersPage } from './pages/UsersPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { SettingsPage } from './pages/SettingsPage';
import { AdminCostDashboard } from '../pages/AdminCostDashboard';

// Admin Context
interface AdminUser {
    token: string;
    role: string;
    name?: string;
}

interface AdminContextType {
    user: AdminUser | null;
    login: (token: string) => void;
    logout: () => void;
    currentPage: string;
    setCurrentPage: (page: string) => void;
}

const AdminContext = createContext<AdminContextType | null>(null);

export const useAdmin = () => {
    const context = useContext(AdminContext);
    if (!context) throw new Error('useAdmin must be used within AdminProvider');
    return context;
};

// Admin App Component
export const AdminApp: React.FC = () => {
    const [user, setUser] = useState<AdminUser | null>(null);
    const [currentPage, setCurrentPage] = useState('dashboard');
    const [isLoading, setIsLoading] = useState(true);

    // Check for saved admin token
    useEffect(() => {
        const savedToken = localStorage.getItem('admin_token');
        if (savedToken) {
            setUser({ token: savedToken, role: 'admin' });
        }
        setIsLoading(false);
    }, []);

    const login = (token: string) => {
        localStorage.setItem('admin_token', token);
        setUser({ token, role: 'admin' });
    };

    const logout = () => {
        localStorage.removeItem('admin_token');
        setUser(null);
        setCurrentPage('dashboard');
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    // Render current page
    const renderPage = () => {
        switch (currentPage) {
            case 'dashboard': return <DashboardPage />;
            case 'records': return <RecordsPage />;
            case 'users': return <UsersPage />;
            case 'analytics': return <AnalyticsPage />;
            case 'cost': return <AdminCostDashboard />;
            case 'settings': return <SettingsPage />;
            default: return <DashboardPage />;
        }
    };

    return (
        <AdminContext.Provider value={{ user, login, logout, currentPage, setCurrentPage }}>
            {!user ? (
                <AdminLogin />
            ) : (
                <AdminLayout>
                    {renderPage()}
                </AdminLayout>
            )}
        </AdminContext.Provider>
    );
};

export default AdminApp;
