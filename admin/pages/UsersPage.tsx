/**
 * Users Page - User management
 */

import React, { useState, useEffect } from 'react';
import { Users, Search, RefreshCw, Mail, Phone, Calendar } from 'lucide-react';
import { adminApi, TestRecord } from '../services/adminApi';
import { useAdmin } from '../index';

interface UserSummary {
    userId: string;
    userName?: string;
    testCount: number;
    lastTest: string;
    highSeverityCount: number;
}

export const UsersPage: React.FC = () => {
    const { user } = useAdmin();
    const [users, setUsers] = useState<UserSummary[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        if (user?.token) {
            adminApi.setToken(user.token);
            loadUsers();
        }
    }, [user?.token]);

    const loadUsers = async () => {
        setIsLoading(true);
        const { records } = await adminApi.getRecords(1000, 0);

        // Aggregate by user
        const userMap = new Map<string, UserSummary>();
        records.forEach(r => {
            const existing = userMap.get(r.userId) || {
                userId: r.userId,
                userName: r.userName,
                testCount: 0,
                lastTest: r.timestamp,
                highSeverityCount: 0,
            };
            existing.testCount++;
            if (r.severity === 'HIGH') existing.highSeverityCount++;
            if (new Date(r.timestamp) > new Date(existing.lastTest)) {
                existing.lastTest = r.timestamp;
            }
            userMap.set(r.userId, existing);
        });

        setUsers(Array.from(userMap.values()));
        setIsLoading(false);
    };

    const filteredUsers = users.filter(u => {
        if (!search) return true;
        return u.userId.toLowerCase().includes(search.toLowerCase()) ||
            u.userName?.toLowerCase().includes(search.toLowerCase());
    });

    return (
        <div className="space-y-4">
            {/* Toolbar */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                    <div className="relative flex-1 max-w-md w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Tìm người dùng..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                    <button
                        onClick={loadUsers}
                        className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50"
                    >
                        <RefreshCw className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Users Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {isLoading ? (
                    <div className="col-span-full flex items-center justify-center py-12">
                        <RefreshCw className="w-8 h-8 animate-spin text-indigo-500" />
                    </div>
                ) : filteredUsers.length === 0 ? (
                    <div className="col-span-full text-center py-12 text-slate-500">
                        <Users className="w-12 h-12 mx-auto mb-2 text-slate-300" />
                        Không có người dùng
                    </div>
                ) : (
                    filteredUsers.map(u => (
                        <div key={u.userId} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                                    {(u.userName || u.userId).charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-slate-800 truncate">{u.userName || 'Người dùng'}</p>
                                    <p className="text-sm text-slate-400 truncate">{u.userId}</p>
                                </div>
                            </div>
                            <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 gap-3 text-sm">
                                <div>
                                    <p className="text-slate-400">Số test</p>
                                    <p className="font-bold text-slate-800">{u.testCount}</p>
                                </div>
                                <div>
                                    <p className="text-slate-400">Cần khám</p>
                                    <p className={`font-bold ${u.highSeverityCount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                        {u.highSeverityCount}
                                    </p>
                                </div>
                            </div>
                            <div className="mt-3 flex items-center gap-1 text-xs text-slate-400">
                                <Calendar className="w-3 h-3" />
                                Test cuối: {new Date(u.lastTest).toLocaleDateString('vi-VN')}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default UsersPage;
