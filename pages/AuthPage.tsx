/**
 * =================================================================
 * 🔐 AuthPage - Login with Name/Age/Phone (Backend Compatible)
 * =================================================================
 *
 * MỤC ĐÍCH:
 * - Đăng nhập với name + age + phone (backend yêu cầu)
 * - Nút Demo Account để dùng thử nhanh
 * - Lưu token xác thực từ backend
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, User, Phone, Calendar, ChevronRight, Loader, AlertCircle, Zap, Shield, Activity } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import {
  loginUser,
  saveAuthToken,
  isValidPhone,
  LoginRequest
} from '../services/authService';

interface SavedAccount {
  name: string;
  phone: string;
  age: string;
  loginTime: number;
}

const SAVED_ACCOUNTS_KEY = 'saved_accounts_v3';

// Demo account credentials
const DEMO_ACCOUNT = {
  name: 'Demo User',
  phone: '0123456789',
  age: '25',
};

export default function AuthPage() {
  const { language, t } = useLanguage();
  const navigate = useNavigate();

  // ============================================================
  // STATE
  // ============================================================

  const [isLoading, setIsLoading] = useState(false);
  const [isDemoLoading, setIsDemoLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [savedAccounts, setSavedAccounts] = useState<SavedAccount[]>([]);

  // Login form fields (matches backend: name, age, phone)
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [age, setAge] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // ============================================================
  // EFFECTS
  // ============================================================

  useEffect(() => {
    loadSavedAccounts();
  }, []);

  // ============================================================
  // HELPER FUNCTIONS
  // ============================================================

  const loadSavedAccounts = () => {
    try {
      const saved = localStorage.getItem(SAVED_ACCOUNTS_KEY);
      if (saved) {
        const accounts = JSON.parse(saved);
        setSavedAccounts(accounts.slice(0, 3));
      }
    } catch (error) {
      console.error('Failed to load saved accounts:', error);
    }
  };

  const saveAccountToHistory = (account: SavedAccount) => {
    try {
      const saved = localStorage.getItem(SAVED_ACCOUNTS_KEY);
      let accounts: SavedAccount[] = saved ? JSON.parse(saved) : [];

      // Remove duplicate by phone
      accounts = accounts.filter(acc => acc.phone !== account.phone);

      accounts.unshift(account);
      accounts = accounts.slice(0, 3);
      localStorage.setItem(SAVED_ACCOUNTS_KEY, JSON.stringify(accounts));
      setSavedAccounts(accounts);
    } catch (error) {
      console.error('Failed to save account history:', error);
    }
  };

  // ============================================================
  // VALIDATION
  // ============================================================

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = language === 'vi' ? 'Vui lòng nhập tên' : 'Please enter your name';
    } else if (name.trim().length < 2) {
      newErrors.name = language === 'vi' ? 'Tên phải có ít nhất 2 ký tự' : 'Name must be at least 2 characters';
    }

    if (!phone.trim()) {
      newErrors.phone = language === 'vi' ? 'Vui lòng nhập số điện thoại' : 'Please enter phone number';
    } else if (!isValidPhone(phone)) {
      newErrors.phone = language === 'vi' ? 'Số điện thoại không hợp lệ (VD: 0912345678)' : 'Invalid phone format (e.g., 0912345678)';
    }

    if (!age.trim()) {
      newErrors.age = language === 'vi' ? 'Vui lòng nhập tuổi' : 'Please enter your age';
    } else {
      const ageNum = parseInt(age);
      if (isNaN(ageNum) || ageNum < 5 || ageNum > 120) {
        newErrors.age = language === 'vi' ? 'Tuổi phải từ 5-120' : 'Age must be between 5-120';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ============================================================
  // HANDLERS
  // ============================================================

  const handleLogin = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    setApiError('');

    try {
      const credentials: LoginRequest = {
        name: name.trim(),
        phone: phone.replace(/\s/g, ''),
        age: age,
      };

      const response = await loginUser(credentials);

      if (response.success && response.user) {
        saveAuthToken(response.user.token);

        const account: SavedAccount = {
          name: response.user.name,
          phone: response.user.phone || phone,
          age: response.user.age || age,
          loginTime: Date.now(),
        };

        saveAccountToHistory(account);
        localStorage.setItem('user_data', JSON.stringify(response.user));
        window.dispatchEvent(new Event('userLoggedIn'));

        navigate('/home');
      } else {
        setApiError(response.error || response.message || 'Login failed');
      }
    } catch (error: any) {
      setApiError(error.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setIsDemoLoading(true);
    setApiError('');

    try {
      const credentials: LoginRequest = {
        name: DEMO_ACCOUNT.name,
        phone: DEMO_ACCOUNT.phone,
        age: DEMO_ACCOUNT.age,
      };

      const response = await loginUser(credentials);

      if (response.success && response.user) {
        saveAuthToken(response.user.token);
        localStorage.setItem('user_data', JSON.stringify(response.user));
        window.dispatchEvent(new Event('userLoggedIn'));
        navigate('/home');
      } else {
        setApiError(response.error || response.message || 'Demo login failed');
      }
    } catch (error: any) {
      setApiError(error.message || 'An error occurred');
    } finally {
      setIsDemoLoading(false);
    }
  };

  const handleSavedAccountLogin = (account: SavedAccount) => {
    setName(account.name);
    setPhone(account.phone);
    setAge(account.age);
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4 font-sans relative overflow-hidden">
      {/* Abstract Background Shapes */}
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-100/40 rounded-full blur-3xl animate-blob"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-100/40 rounded-full blur-3xl animate-blob animation-delay-2000"></div>

      <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-2 gap-8 z-10">

        {/* Left Column: Welcome & Info */}
        <div className="hidden lg:flex flex-col justify-center p-8">
          <div className="mb-8">
            <div className="w-16 h-16 bg-white rounded-2xl shadow-lg flex items-center justify-center mb-6">
              <Eye className="w-8 h-8 text-indigo-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4 leading-tight">
              {language === 'vi' ? 'Chào mừng đến Vision Coach' : 'Welcome to Vision Coach'}
            </h1>
            <p className="text-lg text-gray-600 leading-relaxed">
              {language === 'vi'
                ? 'Ứng dụng kiểm tra và chăm sóc thị lực thông minh với AI'
                : 'Smart AI-powered eye health testing and care application'}
            </p>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-white/50 shadow-sm">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                <Activity size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{language === 'vi' ? '5 Bài test thị lực' : '5 Vision Tests'}</h3>
                <p className="text-sm text-gray-500">{language === 'vi' ? 'Snellen, Màu sắc, Amsler, Loạn thị, Duochrome' : 'Snellen, Color, Amsler, Astigmatism, Duochrome'}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-white/50 shadow-sm">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600">
                <Shield size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{language === 'vi' ? 'Bác sĩ AI Eva' : 'AI Doctor Eva'}</h3>
                <p className="text-sm text-gray-500">{language === 'vi' ? 'Tư vấn sức khỏe mắt 24/7' : '24/7 Eye health consultation'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Auth Form */}
        <div className="animate-fade-in-up">
          <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-2xl shadow-indigo-100/50 p-8 md:p-10 border border-white/50">

            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex w-14 h-14 bg-indigo-50 rounded-2xl items-center justify-center mb-4 lg:hidden">
                <Eye className="w-7 h-7 text-indigo-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                {language === 'vi' ? 'Đăng nhập' : 'Login'}
              </h2>
              <p className="text-gray-500 text-sm mt-1">
                {language === 'vi' ? 'Nhập thông tin để bắt đầu' : 'Enter your info to get started'}
              </p>
            </div>

            {/* Demo Account Button */}
            <button
              onClick={handleDemoLogin}
              disabled={isDemoLoading || isLoading}
              className="w-full mb-6 relative group bg-gradient-to-r from-amber-400 to-orange-500 text-white font-bold py-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {isDemoLoading ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    {language === 'vi' ? 'Đang xử lý...' : 'Processing...'}
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5" />
                    {language === 'vi' ? 'Dùng Tài khoản Demo' : 'Use Demo Account'}
                  </>
                )}
              </span>
            </button>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">
                  {language === 'vi' ? 'hoặc đăng nhập với thông tin của bạn' : 'or login with your info'}
                </span>
              </div>
            </div>

            {/* API Error Alert */}
            {apiError && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-red-700 text-sm font-medium">{apiError}</p>
                </div>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }} className="space-y-5">
              {/* Name */}
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700 ml-1">
                  {language === 'vi' ? 'Họ tên' : 'Full Name'}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={isLoading || isDemoLoading}
                    className={`block w-full pl-11 pr-4 py-3.5 bg-gray-50 border ${errors.name ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-indigo-500 focus:ring-indigo-500/20'
                      } rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-4 transition-all duration-200 disabled:opacity-50`}
                    placeholder={language === 'vi' ? 'Nguyen Van A' : 'John Doe'}
                  />
                </div>
                {errors.name && <p className="text-red-500 text-xs ml-1 font-medium">{errors.name}</p>}
              </div>

              {/* Phone */}
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700 ml-1">
                  {language === 'vi' ? 'Số điện thoại' : 'Phone Number'}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    disabled={isLoading || isDemoLoading}
                    className={`block w-full pl-11 pr-4 py-3.5 bg-gray-50 border ${errors.phone ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-indigo-500 focus:ring-indigo-500/20'
                      } rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-4 transition-all duration-200 disabled:opacity-50`}
                    placeholder="0912345678"
                  />
                </div>
                {errors.phone && <p className="text-red-500 text-xs ml-1 font-medium">{errors.phone}</p>}
              </div>

              {/* Age */}
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700 ml-1">
                  {language === 'vi' ? 'Tuổi' : 'Age'}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Calendar className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    disabled={isLoading || isDemoLoading}
                    className={`block w-full pl-11 pr-4 py-3.5 bg-gray-50 border ${errors.age ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-indigo-500 focus:ring-indigo-500/20'
                      } rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-4 transition-all duration-200 disabled:opacity-50`}
                    placeholder="25"
                    min="5"
                    max="120"
                  />
                </div>
                {errors.age && <p className="text-red-500 text-xs ml-1 font-medium">{errors.age}</p>}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading || isDemoLoading}
                className="w-full relative group bg-gray-900 text-white font-bold py-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {isLoading ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      {language === 'vi' ? 'Đang xử lý...' : 'Processing...'}
                    </>
                  ) : (
                    <>
                      {language === 'vi' ? 'Đăng nhập' : 'Login'}
                      <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </span>
              </button>
            </form>

            {/* Saved Accounts */}
            {savedAccounts.length > 0 && (
              <div className="mt-8 pt-6 border-t border-gray-100">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 text-center">
                  {language === 'vi' ? 'Tài khoản đã lưu' : 'Saved Accounts'}
                </p>
                <div className="space-y-2">
                  {savedAccounts.map((account, index) => (
                    <button
                      key={index}
                      onClick={() => handleSavedAccountLogin(account)}
                      disabled={isLoading || isDemoLoading}
                      className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-all duration-200 group text-left disabled:opacity-50"
                    >
                      <div className="w-10 h-10 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-sm group-hover:scale-110 transition-transform">
                        {account.name.split(' ').pop()?.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-gray-900 text-sm truncate">{account.name}</div>
                        <div className="text-xs text-gray-500 truncate">{account.phone} • {account.age} {language === 'vi' ? 'tuổi' : 'years'}</div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-indigo-500 transition-colors" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
@keyframes blob {
  0% { transform: translate(0px, 0px) scale(1); }
  33% { transform: translate(30px, -50px) scale(1.1); }
  66% { transform: translate(-20px, 20px) scale(0.9); }
  100% { transform: translate(0px, 0px) scale(1); }
}
.animate-blob { animation: blob 7s infinite; }
.animation-delay-2000 { animation-delay: 2s; }
.animate-fade-in-up { animation: fadeInUp 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) both; }
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
@media (prefers-reduced-motion: reduce) {
  .animate-blob, .animate-fade-in-up { animation: none !important; }
}
`}</style>
    </div>
  );
}
