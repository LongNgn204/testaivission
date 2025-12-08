/**
 * Analytics Page - Charts and statistics
 */

import React, { useState, useEffect } from 'react';
import {
    BarChart3, PieChart, TrendingUp, RefreshCw,
    Eye, AlertTriangle, Activity, Calendar
} from 'lucide-react';
import { adminApi, DashboardStats } from '../services/adminApi';
import { useAdmin } from '../index';

export const AnalyticsPage: React.FC = () => {
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

    const testTypeColors: Record<string, string> = {
        snellen: 'bg-blue-500',
        colorblind: 'bg-green-500',
        astigmatism: 'bg-purple-500',
        amsler: 'bg-orange-500',
        duochrome: 'bg-pink-500',
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <RefreshCw className="w-8 h-8 animate-spin text-indigo-500" />
            </div>
        );
    }

    const totalTests = stats?.totalTests || 1;
    const testsByType = stats?.testsByType || {};

    return (
        <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <SummaryCard
                    icon={Activity}
                    label="Tổng test"
                    value={stats?.totalTests || 0}
                    color="indigo"
                />
                <SummaryCard
                    icon={Eye}
                    label="Người dùng"
                    value={stats?.totalUsers || 0}
                    color="blue"
                />
                <SummaryCard
                    icon={Calendar}
                    label="Hôm nay"
                    value={stats?.todayTests || 0}
                    color="green"
                />
                <SummaryCard
                    icon={AlertTriangle}
                    label="Cần khám"
                    value={stats?.highSeverityCount || 0}
                    color="red"
                />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Bar Chart */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                    <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-indigo-500" />
                        Phân bố loại test
                    </h3>
                    <div className="space-y-4">
                        {Object.entries(testsByType).map(([type, count]) => {
                            const percentage = Math.round((count / totalTests) * 100);
                            return (
                                <div key={type}>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-slate-600">{testTypeLabels[type] || type}</span>
                                        <span className="font-medium text-slate-800">{count}</span>
                                    </div>
                                    <div className="h-4 bg-slate-100 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full ${testTypeColors[type] || 'bg-indigo-500'} rounded-full transition-all duration-500`}
                                            style={{ width: `${percentage}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                        {Object.keys(testsByType).length === 0 && (
                            <p className="text-center text-slate-400 py-8">Chưa có dữ liệu</p>
                        )}
                    </div>
                </div>

                {/* Pie Chart Visual */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                    <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <PieChart className="w-5 h-5 text-indigo-500" />
                        Tỷ lệ phần trăm
                    </h3>
                    <div className="flex items-center justify-center">
                        <div className="relative w-48 h-48">
                            {/* Simple pie chart visualization */}
                            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                                {(() => {
                                    let offset = 0;
                                    return Object.entries(testsByType).map(([type, count], index) => {
                                        const percentage = (count / totalTests) * 100;
                                        const color = testTypeColors[type]?.replace('bg-', '') || 'indigo-500';
                                        const circumference = 2 * Math.PI * 40;
                                        const dashLength = (percentage / 100) * circumference;
                                        const currentOffset = offset;
                                        offset += dashLength;

                                        return (
                                            <circle
                                                key={type}
                                                cx="50"
                                                cy="50"
                                                r="40"
                                                fill="none"
                                                stroke={`hsl(${index * 60}, 70%, 50%)`}
                                                strokeWidth="20"
                                                strokeDasharray={`${dashLength} ${circumference}`}
                                                strokeDashoffset={-currentOffset}
                                            />
                                        );
                                    });
                                })()}
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-slate-800">{totalTests}</p>
                                    <p className="text-xs text-slate-400">Tests</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-2">
                        {Object.entries(testsByType).map(([type, count]) => (
                            <div key={type} className="flex items-center gap-2 text-sm">
                                <div className={`w-3 h-3 rounded-full ${testTypeColors[type] || 'bg-indigo-500'}`} />
                                <span className="text-slate-600">{testTypeLabels[type]}</span>
                                <span className="text-slate-400">({Math.round((count / totalTests) * 100)}%)</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Severity Breakdown */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-indigo-500" />
                    Phân tích mức độ
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="text-center p-4 rounded-xl bg-green-50">
                        <p className="text-3xl font-bold text-green-600">
                            {totalTests - (stats?.highSeverityCount || 0)}
                        </p>
                        <p className="text-sm text-green-700">Bình thường</p>
                    </div>
                    <div className="text-center p-4 rounded-xl bg-yellow-50">
                        <p className="text-3xl font-bold text-yellow-600">
                            {Math.floor((stats?.highSeverityCount || 0) * 0.3)}
                        </p>
                        <p className="text-sm text-yellow-700">Cần chú ý</p>
                    </div>
                    <div className="text-center p-4 rounded-xl bg-orange-50">
                        <p className="text-3xl font-bold text-orange-600">
                            {Math.floor((stats?.highSeverityCount || 0) * 0.3)}
                        </p>
                        <p className="text-sm text-orange-700">Nhẹ</p>
                    </div>
                    <div className="text-center p-4 rounded-xl bg-red-50">
                        <p className="text-3xl font-bold text-red-600">
                            {stats?.highSeverityCount || 0}
                        </p>
                        <p className="text-sm text-red-700">Cần khám</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Summary Card Component
const SummaryCard: React.FC<{
    icon: React.ElementType;
    label: string;
    value: number;
    color: string;
}> = ({ icon: Icon, label, value, color }) => {
    const colorClasses: Record<string, { bg: string; text: string }> = {
        indigo: { bg: 'bg-indigo-50', text: 'text-indigo-600' },
        blue: { bg: 'bg-blue-50', text: 'text-blue-600' },
        green: { bg: 'bg-green-50', text: 'text-green-600' },
        red: { bg: 'bg-red-50', text: 'text-red-600' },
    };

    return (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
            <div className={`w-10 h-10 ${colorClasses[color].bg} rounded-xl flex items-center justify-center mb-3`}>
                <Icon className={`w-5 h-5 ${colorClasses[color].text}`} />
            </div>
            <p className="text-2xl font-bold text-slate-800">{value.toLocaleString()}</p>
            <p className="text-sm text-slate-500">{label}</p>
        </div>
    );
};

export default AnalyticsPage;
