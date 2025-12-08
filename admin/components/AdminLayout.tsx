/**
 * Admin Layout with Sidebar Navigation
 */

import React, { useState } from 'react';
import {
    LayoutDashboard, FileText, Users, BarChart3, Settings,
    LogOut, Menu, X, Shield, ChevronRight, Bell
} from 'lucide-react';
import { useAdmin } from '../index';

interface NavItem {
    id: string;
    label: string;
    icon: React.ElementType;
}

const navItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'records', label: 'Hồ Sơ Khám', icon: FileText },
    { id: 'users', label: 'Người Dùng', icon: Users },
    { id: 'analytics', label: 'Thống Kê', icon: BarChart3 },
    { id: 'settings', label: 'Cài Đặt', icon: Settings },
];

export const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { logout, currentPage, setCurrentPage } = useAdmin();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <div className="min-h-screen bg-slate-50 flex">
            {/* Sidebar - Desktop */}
            <aside className={`hidden md:flex flex-col bg-white border-r border-slate-200 transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-20'
                }`}>
                {/* Logo */}
                <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200">
                    {sidebarOpen && (
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                                <Shield className="w-5 h-5 text-white" />
                            </div>
                            <span className="font-bold text-slate-800">Admin</span>
                        </div>
                    )}
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="p-2 rounded-lg hover:bg-slate-100 text-slate-500"
                    >
                        <ChevronRight className={`w-5 h-5 transition-transform ${sidebarOpen ? 'rotate-180' : ''}`} />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-1">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = currentPage === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => setCurrentPage(item.id)}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${isActive
                                        ? 'bg-indigo-50 text-indigo-600'
                                        : 'text-slate-600 hover:bg-slate-100'
                                    }`}
                            >
                                <Icon className="w-5 h-5 flex-shrink-0" />
                                {sidebarOpen && <span className="font-medium">{item.label}</span>}
                            </button>
                        );
                    })}
                </nav>

                {/* Logout */}
                <div className="p-4 border-t border-slate-200">
                    <button
                        onClick={logout}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-600 hover:bg-red-50 transition-colors"
                    >
                        <LogOut className="w-5 h-5 flex-shrink-0" />
                        {sidebarOpen && <span className="font-medium">Đăng xuất</span>}
                    </button>
                </div>
            </aside>

            {/* Mobile Sidebar Overlay */}
            {mobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={() => setMobileMenuOpen(false)}
                />
            )}

            {/* Mobile Sidebar */}
            <aside className={`fixed inset-y-0 left-0 w-64 bg-white z-50 transform transition-transform md:hidden ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
                }`}>
                <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                            <Shield className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-bold text-slate-800">Admin</span>
                    </div>
                    <button
                        onClick={() => setMobileMenuOpen(false)}
                        className="p-2 rounded-lg hover:bg-slate-100 text-slate-500"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <nav className="p-4 space-y-1">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = currentPage === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => {
                                    setCurrentPage(item.id);
                                    setMobileMenuOpen(false);
                                }}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${isActive
                                        ? 'bg-indigo-50 text-indigo-600'
                                        : 'text-slate-600 hover:bg-slate-100'
                                    }`}
                            >
                                <Icon className="w-5 h-5 flex-shrink-0" />
                                <span className="font-medium">{item.label}</span>
                            </button>
                        );
                    })}
                </nav>
                <div className="p-4 border-t border-slate-200">
                    <button
                        onClick={logout}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-600 hover:bg-red-50 transition-colors"
                    >
                        <LogOut className="w-5 h-5 flex-shrink-0" />
                        <span className="font-medium">Đăng xuất</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-h-screen">
                {/* Header */}
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-6">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setMobileMenuOpen(true)}
                            className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 md:hidden"
                        >
                            <Menu className="w-5 h-5" />
                        </button>
                        <h1 className="text-lg font-bold text-slate-800 capitalize">
                            {navItems.find(n => n.id === currentPage)?.label || 'Dashboard'}
                        </h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 relative">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                        </button>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 p-4 lg:p-6 overflow-auto">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
