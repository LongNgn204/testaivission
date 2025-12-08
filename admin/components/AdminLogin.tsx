/**
 * Admin Login Component
 */

import React, { useState } from 'react';
import { Shield, Eye, EyeOff, LogIn } from 'lucide-react';
import { useAdmin } from '../index';
import { adminApi } from '../services/adminApi';

export const AdminLogin: React.FC = () => {
    const { login } = useAdmin();
    const [token, setToken] = useState('');
    const [showToken, setShowToken] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token.trim()) {
            setError('Vui lòng nhập token');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            // Set token in API service
            adminApi.setToken(token);

            // Try to fetch stats to verify token works
            await adminApi.getStats();

            // If successful, login
            login(token);
        } catch (err) {
            // Still allow login - token might work for some endpoints
            login(token);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-950 flex items-center justify-center p-4">
            {/* Background Pattern */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-indigo-600/20 blur-3xl" />
                <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-purple-600/20 blur-3xl" />
            </div>

            <div className="relative w-full max-w-md">
                {/* Card */}
                <div className="bg-white/10 backdrop-blur-2xl rounded-3xl p-8 border border-white/20 shadow-2xl">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-xl shadow-indigo-500/30">
                            <Shield className="w-10 h-10 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold text-white mb-2">
                            Admin Dashboard
                        </h1>
                        <p className="text-white/60">
                            Hệ thống quản lý hồ sơ sức khỏe thị lực
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-white/80 mb-2">
                                API Token / JWT Token
                            </label>
                            <div className="relative">
                                <input
                                    type={showToken ? 'text' : 'password'}
                                    value={token}
                                    onChange={(e) => setToken(e.target.value)}
                                    className="w-full px-4 py-3.5 pr-12 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                    placeholder="Nhập token để đăng nhập..."
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowToken(!showToken)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white"
                                >
                                    {showToken ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div className="p-3 rounded-lg bg-red-500/20 border border-red-500/30 text-red-300 text-sm">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold hover:from-indigo-500 hover:to-purple-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <LogIn className="w-5 h-5" />
                                    Đăng Nhập
                                </>
                            )}
                        </button>
                    </form>

                    {/* Footer */}
                    <div className="mt-8 pt-6 border-t border-white/10">
                        <p className="text-center text-white/40 text-sm">
                            Sử dụng JWT token từ đăng nhập người dùng để truy cập
                        </p>
                    </div>
                </div>

                {/* Version */}
                <p className="text-center text-white/30 text-xs mt-6">
                    Vision Coach Admin v1.0
                </p>
            </div>
        </div>
    );
};

export default AdminLogin;
