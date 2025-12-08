/**
 * Dashboard Page - Overview with stats and charts
 */

import React, { useState, useEffect } from 'react';
import {
    Users, FileText, Activity, AlertTriangle, TrendingUp,
    Eye, Clock, RefreshCw, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import { adminApi, DashboardStats } from '../services/adminApi';
import { useAdmin } from '../index';

export const DashboardPage: React.FC = () => {
    const { user } = useAdmin();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (user?.token) {
            adminApi.setToken(user.token);
            loadStats();
        }
    }, [user?.token]);

    const loadStats = async () => {
        setIsLoading(true);
        const data = await adminApi.getStats();
        setStats(data);
        setIsLoading(false);
    };

    const testTypeLabels: Record<string, string> = {
        snellen: 'Thị lực',
        colorblind: 'Mù màu',
        astigmatism: 'Loạn thị',
        amsler: 'Amsler',
        duochrome: 'Duochrome',
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <RefreshCw className="w-8 h-8 animate-spin text-indigo-500" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    icon={Users}
                    label="Người dùng"
                    value={stats?.totalUsers || 0}
                    change="+12%"
                    positive
                    color="blue"
                />
                <StatCard
                    icon={FileText}
                    label="Tổng hồ sơ"
                    value={stats?.totalTests || 0}
                    change="+8%"
                    positive
                    color="indigo"
                />
                <StatCard
                    icon={Activity}
                    label="Hôm nay"
                    value={stats?.todayTests || 0}
                    color="green"
                />
                <StatCard
                    icon={AlertTriangle}
                    label="Cần khám"
                    value={stats?.highSeverityCount || 0}
                    color="red"
                />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Test Types Chart */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                    <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <Eye className="w-5 h-5 text-indigo-500" />
                        Phân bố loại test
                    </h3>
                    <div className="space-y-3">
                        {Object.entries(stats?.testsByType || {}).map(([type, count]) => {
                            const total = stats?.totalTests || 1;
                            const percentage = Math.round((count / total) * 100);
                            return (
                                <div key={type} className="space-y-1">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-600">{testTypeLabels[type] || type}</span>
                                        <span className="font-medium text-slate-800">{count} ({percentage}%)</span>
                                    </div>
                                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                                            style={{ width: `${percentage}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                        {Object.keys(stats?.testsByType || {}).length === 0 && (
                            <p className="text-slate-400 text-center py-8">Chưa có dữ liệu</p>
                        )}
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                    <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-indigo-500" />
                        Hoạt động gần đây
                    </h3>
                    <div className="space-y-3 max-h-80 overflow-y-auto">
                        {stats?.recentActivity.map((activity) => (
                            <div key={activity.id} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
                                <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0">
                                    <FileText className="w-4 h-4 text-indigo-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-slate-800 truncate">
                                        {activity.description}
                                    </p>
                                    <p className="text-xs text-slate-400">
                                        {new Date(activity.timestamp).toLocaleString('vi-VN')}
                                    </p>
                                </div>
                            </div>
                        ))}
                        {stats?.recentActivity.length === 0 && (
                            <p className="text-slate-400 text-center py-8">Chưa có hoạt động</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <h3 className="text-lg font-bold text-slate-800 mb-4">Thao tác nhanh</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <QuickAction icon={FileText} label="Xem hồ sơ" />
                    <QuickAction icon={Users} label="Quản lý users" />
                    <QuickAction icon={TrendingUp} label="Báo cáo" />
                    <QuickAction icon={RefreshCw} label="Làm mới" onClick={loadStats} />
                </div>
            </div>
        </div>
    );
};

// Stat Card Component
const StatCard: React.FC<{
    icon: React.ElementType;
    label: string;
    value: number;
    change?: string;
    positive?: boolean;
    color: string;
}> = ({ icon: Icon, label, value, change, positive, color }) => {
    const colorClasses: Record<string, { bg: string; icon: string }> = {
        blue: { bg: 'bg-blue-50', icon: 'text-blue-500' },
        indigo: { bg: 'bg-indigo-50', icon: 'text-indigo-500' },
        green: { bg: 'bg-green-50', icon: 'text-green-500' },
        red: { bg: 'bg-red-50', icon: 'text-red-500' },
    };

    return (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl ${colorClasses[color].bg} flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${colorClasses[color].icon}`} />
                </div>
                {change && (
                    <div className={`flex items-center gap-1 text-xs font-medium ${positive ? 'text-green-600' : 'text-red-600'}`}>
                        {positive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                        {change}
                    </div>
                )}
            </div>
            <p className="text-2xl font-bold text-slate-800">{value.toLocaleString()}</p>
            <p className="text-sm text-slate-500">{label}</p>
        </div>
    );
};

// Quick Action Component
const QuickAction: React.FC<{
    icon: React.ElementType;
    label: string;
    onClick?: () => void;
}> = ({ icon: Icon, label, onClick }) => (
    <button
        onClick={onClick}
        className="flex flex-col items-center gap-2 p-4 rounded-xl bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 transition-colors text-slate-600"
    >
        <Icon className="w-6 h-6" />
        <span className="text-sm font-medium">{label}</span>
    </button>
);

export default DashboardPage;
