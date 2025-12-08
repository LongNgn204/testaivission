/**
 * Settings Page - Admin settings
 */

import React, { useState } from 'react';
import { Settings, Save, RefreshCw, Database, Globe, Bell, Shield, Key } from 'lucide-react';
import { useAdmin } from '../index';

export const SettingsPage: React.FC = () => {
    const { user, logout } = useAdmin();
    const [apiUrl, setApiUrl] = useState(import.meta.env.VITE_API_URL || '');
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState('');

    const handleSave = async () => {
        setIsSaving(true);
        setMessage('');

        setTimeout(() => {
            setMessage('Cài đặt đã được lưu!');
            setIsSaving(false);
        }, 1000);
    };

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            {/* API Settings */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Database className="w-5 h-5 text-indigo-500" />
                    Cấu hình API
                </h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-600 mb-2">
                            API Base URL
                        </label>
                        <input
                            type="text"
                            value={apiUrl}
                            onChange={(e) => setApiUrl(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="https://your-api.workers.dev"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-600 mb-2">
                            Current Token
                        </label>
                        <input
                            type="password"
                            value={user?.token?.slice(0, 20) + '...' || ''}
                            disabled
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-400"
                        />
                    </div>
                </div>
            </div>

            {/* Export Settings */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Globe className="w-5 h-5 text-indigo-500" />
                    Cài đặt xuất dữ liệu
                </h3>
                <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                        <div>
                            <p className="font-medium text-slate-800">Định dạng xuất</p>
                            <p className="text-sm text-slate-500">Định dạng file khi xuất Excel</p>
                        </div>
                        <select className="px-3 py-2 rounded-lg border border-slate-200">
                            <option>CSV (UTF-8)</option>
                            <option>CSV (ANSI)</option>
                        </select>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                        <div>
                            <p className="font-medium text-slate-800">Bao gồm tiêu đề</p>
                            <p className="text-sm text-slate-500">Thêm hàng tiêu đề vào file xuất</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" defaultChecked className="sr-only peer" />
                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:bg-indigo-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
                        </label>
                    </div>
                </div>
            </div>

            {/* Security */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-indigo-500" />
                    Bảo mật
                </h3>
                <div className="space-y-4">
                    <button
                        onClick={logout}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
                    >
                        <Key className="w-4 h-4" />
                        Đăng xuất khỏi Admin
                    </button>
                </div>
            </div>

            {/* Save Button */}
            <div className="flex items-center justify-between">
                {message && (
                    <p className="text-green-600 font-medium">{message}</p>
                )}
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 disabled:opacity-50 ml-auto"
                >
                    {isSaving ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                        <Save className="w-4 h-4" />
                    )}
                    Lưu cài đặt
                </button>
            </div>

            {/* Info */}
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                <h4 className="font-bold text-slate-700 mb-2">Thông tin hệ thống</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <p className="text-slate-500">Phiên bản</p>
                        <p className="font-medium text-slate-800">Admin v1.0.0</p>
                    </div>
                    <div>
                        <p className="text-slate-500">Môi trường</p>
                        <p className="font-medium text-slate-800">Production</p>
                    </div>
                    <div>
                        <p className="text-slate-500">API Endpoint</p>
                        <p className="font-medium text-slate-800 truncate">{apiUrl || 'Not configured'}</p>
                    </div>
                    <div>
                        <p className="text-slate-500">Trạng thái</p>
                        <p className="font-medium text-green-600">Active</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
