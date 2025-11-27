/**
 * =================================================================
 * 🔐 AuthPage - Unified Login & Registration with Password
 * =================================================================
 *
 * MỤC ĐÍCH:
 * - Cho phép người dùng đăng ký tài khoản mới với mật khẩu
 * - Cho phép người dùng đăng nhập với email/phone + password
 * - Xác thực mật khẩu trên backend
 * - Lưu token xác thực từ backend
 * - Hiển thị danh sách tài khoản đã đăng nhập trước đó
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, User, Mail, Phone, Lock, Calendar, LogIn, Zap, ChevronRight, Loader, AlertCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { 
  registerUser, 
  loginUser, 
  saveAuthToken, 
  validatePassword,
  isValidEmail,
  isValidPhone,
  RegisterRequest,
  LoginRequest 
} from '../services/authService';

interface SavedAccount {
  name: string;
  email?: string;
  phone?: string;
  loginTime: number;
}

const SAVED_ACCOUNTS_KEY = 'saved_accounts_v2';

export default function AuthPage() {
  const { language, t } = useLanguage();
  const navigate = useNavigate();

  // ============================================================
  // STATE
  // ============================================================

  const [mode, setMode] = useState<'login' | 'register'>('login'); // Login or Register mode
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [savedAccounts, setSavedAccounts] = useState<SavedAccount[]>([]);

  // Login form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPhone, setLoginPhone] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginErrors, setLoginErrors] = useState<Record<string, string>>({});
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Register form
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regAge, setRegAge] = useState('');
  const [regErrors, setRegErrors] = useState<Record<string, string>>({});
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);

  // ============================================================
  // EFFECTS
  // ============================================================

  React.useEffect(() => {
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
        setSavedAccounts(accounts.slice(0, 5));
      }
    } catch (error) {
      console.error('Failed to load saved accounts:', error);
    }
  };

  const saveAccountToHistory = (account: SavedAccount) => {
    try {
      const saved = localStorage.getItem(SAVED_ACCOUNTS_KEY);
      let accounts: SavedAccount[] = saved ? JSON.parse(saved) : [];
      
      // Remove duplicate
      accounts = accounts.filter(acc => 
        (acc.email && acc.email === account.email) || 
        (acc.phone && acc.phone === account.phone) ? false : true
      );
      
      accounts.unshift(account);
      accounts = accounts.slice(0, 5);
      localStorage.setItem(SAVED_ACCOUNTS_KEY, JSON.stringify(accounts));
      setSavedAccounts(accounts);
    } catch (error) {
      console.error('Failed to save account history:', error);
    }
  };

  // ============================================================
  // VALIDATION
  // ============================================================

  const validateLoginForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!loginEmail && !loginPhone) {
      errors.email = language === 'vi' ? 'Vui lòng nhập email hoặc số điện thoại' : 'Please enter email or phone number';
    }

    if (loginEmail && !isValidEmail(loginEmail)) {
      errors.email = language === 'vi' ? 'Email không hợp lệ' : 'Invalid email format';
    }

    if (loginPhone && !isValidPhone(loginPhone)) {
      errors.phone = language === 'vi' ? 'Số điện thoại không hợp lệ (VD: 0912345678)' : 'Invalid phone number';
    }

    if (!loginPassword) {
      errors.password = language === 'vi' ? 'Vui lòng nhập mật khẩu' : 'Please enter password';
    }

    setLoginErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateRegisterForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!regName.trim()) {
      errors.name = language === 'vi' ? 'Vui lòng nhập tên' : 'Please enter your name';
    } else if (regName.trim().length < 2) {
      errors.name = language === 'vi' ? 'Tên phải có ít nhất 2 ký tự' : 'Name must be at least 2 characters';
    }

    if (!regEmail && !regPhone) {
      errors.email = language === 'vi' ? 'Vui lòng nhập email hoặc số điện thoại' : 'Please enter email or phone number';
    }

    if (regEmail && !isValidEmail(regEmail)) {
      errors.email = language === 'vi' ? 'Email không hợp lệ' : 'Invalid email format';
    }

    if (regPhone && !isValidPhone(regPhone)) {
      errors.phone = language === 'vi' ? 'Số điện thoại không hợp lệ (VD: 0912345678)' : 'Invalid phone number';
    }

    if (!regPassword) {
      errors.password = language === 'vi' ? 'Vui lòng nhập mật khẩu' : 'Please enter password';
    } else {
      const validation = validatePassword(regPassword);
      if (!validation.valid) {
        errors.password = validation.errors[0];
      }
    }

    if (!regConfirmPassword) {
      errors.confirmPassword = language === 'vi' ? 'Vui lòng xác nhận mật khẩu' : 'Please confirm password';
    } else if (regPassword !== regConfirmPassword) {
      errors.confirmPassword = language === 'vi' ? 'Mật khẩu không khớp' : 'Passwords do not match';
    }

    setRegErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ============================================================
  // HANDLERS
  // ============================================================

  const handleLogin = async () => {
    if (!validateLoginForm()) return;

    setIsLoading(true);
    setApiError('');

    try {
      const credentials: LoginRequest = {
        email: loginEmail || undefined,
        phone: loginPhone || undefined,
        password: loginPassword,
      };

      const response = await loginUser(credentials);

      if (response.success && response.user) {
        saveAuthToken(response.user.token);

        const account: SavedAccount = {
          name: response.user.name,
          email: response.user.email,
          phone: response.user.phone,
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

  const handleRegister = async () => {
    if (!validateRegisterForm()) return;

    setIsLoading(true);
    setApiError('');

    try {
      const credentials: RegisterRequest = {
        name: regName.trim(),
        email: regEmail || undefined,
        phone: regPhone || undefined,
        password: regPassword,
        age: regAge || undefined,
      };

      const response = await registerUser(credentials);

      if (response.success && response.user) {
        saveAuthToken(response.user.token);

        const account: SavedAccount = {
          name: response.user.name,
          email: response.user.email,
          phone: response.user.phone,
          loginTime: Date.now(),
        };

        saveAccountToHistory(account);
        localStorage.setItem('user_data', JSON.stringify(response.user));
        window.dispatchEvent(new Event('userLoggedIn'));

        navigate('/home');
      } else {
        setApiError(response.error || response.message || 'Registration failed');
      }
    } catch (error: any) {
      setApiError(error.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSavedAccountLogin = async (account: SavedAccount) => {
    setIsLoading(true);
    setApiError('');

    try {
      // For saved accounts, we need to prompt for password
      // For now, we'll show a modal or navigate to login with pre-filled fields
      if (account.email) {
        setLoginEmail(account.email);
      }
      if (account.phone) {
        setLoginPhone(account.phone);
      }
      setMode('login');
      setLoginPassword(''); // Clear password for security
    } finally {
      setIsLoading(false);
    }
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
              {t('welcome_title')}
            </h1>
            <p className="text-lg text-gray-600 leading-relaxed">
              {t('welcome_subtitle')}
            </p>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-white/50 shadow-sm">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                <Lock size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Secure Authentication</h3>
                <p className="text-sm text-gray-500">Password-protected accounts</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-white/50 shadow-sm">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600">
                <Calendar size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Test History</h3>
                <p className="text-sm text-gray-500">Track all your vision tests</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Auth Form */}
        <div className="animate-fade-in-up">
          <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-2xl shadow-indigo-100/50 p-8 md:p-10 border border-white/50">

            {/* Mobile Header */}
            <div className="lg:hidden text-center mb-8">
              <div className="inline-flex w-14 h-14 bg-indigo-50 rounded-2xl items-center justify-center mb-4">
                <Eye className="w-7 h-7 text-indigo-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                {mode === 'login' ? t('login_title') : 'Create Account'}
              </h2>
              <p className="text-gray-500 text-sm mt-1">
                {mode === 'login' ? t('login_subtitle') : 'Join Vision Coach today'}
              </p>
            </div>

            <div className="hidden lg:block mb-8">
              <h2 className="text-2xl font-bold text-gray-900">
                {mode === 'login' ? t('login_title') : 'Create Account'}
              </h2>
              <p className="text-gray-500 text-sm mt-1">
                {mode === 'login' ? 'Enter your credentials to access your dashboard' : 'Register a new account with password'}
              </p>
            </div>

            {/* Mode Toggle */}
            <div className="flex gap-2 mb-6 bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => { setMode('login'); setApiError(''); }}
                className={`flex-1 py-2 px-4 rounded-md font-semibold transition-all duration-200 ${
                  mode === 'login'
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {language === 'vi' ? 'Đăng nhập' : 'Login'}
              </button>
              <button
                onClick={() => { setMode('register'); setApiError(''); }}
                className={`flex-1 py-2 px-4 rounded-md font-semibold transition-all duration-200 ${
                  mode === 'register'
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {language === 'vi' ? 'Đăng ký' : 'Register'}
              </button>
            </div>

            {/* API Error Alert */}
            {apiError && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-red-700 text-sm font-medium">{apiError}</p>
                  <p className="text-red-600 text-xs mt-1">
                    {language === 'vi' 
                      ? 'Đảm bảo backend server đang chạy trên http://localhost:3001'
                      : 'Make sure the backend server is running on http://localhost:3001'}
                  </p>
                </div>
              </div>
            )}

            {/* ============================================================ */}
            {/* LOGIN FORM */}
            {/* ============================================================ */}
            {mode === 'login' && (
              <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }} className="space-y-5">
                {/* Email or Phone */}
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700 ml-1">
                    {language === 'vi' ? 'Email hoặc Số điện thoại' : 'Email or Phone'}
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="email"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        disabled={isLoading}
                        className={`block w-full pl-11 pr-4 py-3.5 bg-gray-50 border ${
                          loginErrors.email ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-indigo-500 focus:ring-indigo-500/20'
                        } rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-4 transition-all duration-200 disabled:opacity-50`}
                        placeholder="you@example.com"
                      />
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Phone className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="tel"
                        value={loginPhone}
                        onChange={(e) => setLoginPhone(e.target.value)}
                        disabled={isLoading}
                        className={`block w-full pl-11 pr-4 py-3.5 bg-gray-50 border ${
                          loginErrors.phone ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-indigo-500 focus:ring-indigo-500/20'
                        } rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-4 transition-all duration-200 disabled:opacity-50`}
                        placeholder="0912..."
                      />
                    </div>
                  </div>
                  {(loginErrors.email || loginErrors.phone) && (
                    <p className="text-red-500 text-xs ml-1 font-medium">{loginErrors.email || loginErrors.phone}</p>
                  )}
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700 ml-1">
                    {language === 'vi' ? 'Mật khẩu' : 'Password'}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type={showLoginPassword ? 'text' : 'password'}
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      disabled={isLoading}
                      className={`block w-full pl-11 pr-12 py-3.5 bg-gray-50 border ${
                        loginErrors.password ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-indigo-500 focus:ring-indigo-500/20'
                      } rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-4 transition-all duration-200 disabled:opacity-50`}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
                    >
                      {showLoginPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  {loginErrors.password && <p className="text-red-500 text-xs ml-1 font-medium">{loginErrors.password}</p>}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
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
            )}

            {/* ============================================================ */}
            {/* REGISTER FORM */}
            {/* ============================================================ */}
            {mode === 'register' && (
              <form onSubmit={(e) => { e.preventDefault(); handleRegister(); }} className="space-y-5">
                {/* Name */}
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700 ml-1">
                    {language === 'vi' ? 'Tên' : 'Full Name'}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      disabled={isLoading}
                      className={`block w-full pl-11 pr-4 py-3.5 bg-gray-50 border ${
                        regErrors.name ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-indigo-500 focus:ring-indigo-500/20'
                      } rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-4 transition-all duration-200 disabled:opacity-50`}
                      placeholder="Nguyen Van A"
                    />
                  </div>
                  {regErrors.name && <p className="text-red-500 text-xs ml-1 font-medium">{regErrors.name}</p>}
                </div>

                {/* Email & Phone */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-gray-700 ml-1">
                      {language === 'vi' ? 'Email' : 'Email'}
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="email"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        disabled={isLoading}
                        className={`block w-full pl-11 pr-4 py-3.5 bg-gray-50 border ${
                          regErrors.email ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-indigo-500 focus:ring-indigo-500/20'
                        } rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-4 transition-all duration-200 disabled:opacity-50`}
                        placeholder="you@example.com"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-gray-700 ml-1">
                      {language === 'vi' ? 'Số điện thoại' : 'Phone'}
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Phone className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="tel"
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        disabled={isLoading}
                        className={`block w-full pl-11 pr-4 py-3.5 bg-gray-50 border ${
                          regErrors.phone ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-indigo-500 focus:ring-indigo-500/20'
                        } rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-4 transition-all duration-200 disabled:opacity-50`}
                        placeholder="0912..."
                      />
                    </div>
                  </div>
                </div>
                {(regErrors.email || regErrors.phone) && (
                  <p className="text-red-500 text-xs ml-1 font-medium">{regErrors.email || regErrors.phone}</p>
                )}

                {/* Age */}
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700 ml-1">
                    {language === 'vi' ? 'Tuổi (tùy chọn)' : 'Age (Optional)'}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Calendar className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="number"
                      value={regAge}
                      onChange={(e) => setRegAge(e.target.value)}
                      disabled={isLoading}
                      className="block w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 focus:border-indigo-500 focus:ring-indigo-500/20 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-4 transition-all duration-200 disabled:opacity-50"
                      placeholder="25"
                      min="5"
                      max="120"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700 ml-1">
                    {language === 'vi' ? 'Mật khẩu' : 'Password'}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type={showRegPassword ? 'text' : 'password'}
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      disabled={isLoading}
                      className={`block w-full pl-11 pr-12 py-3.5 bg-gray-50 border ${
                        regErrors.password ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-indigo-500 focus:ring-indigo-500/20'
                      } rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-4 transition-all duration-200 disabled:opacity-50`}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegPassword(!showRegPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
                    >
                      {showRegPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  {regErrors.password && <p className="text-red-500 text-xs ml-1 font-medium">{regErrors.password}</p>}
                  <p className="text-xs text-gray-500 ml-1">{language === 'vi' ? 'Tối thiểu 6 ký tự' : 'Minimum 6 characters'}</p>
                </div>

                {/* Confirm Password */}
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700 ml-1">
                    {language === 'vi' ? 'Xác nhận mật khẩu' : 'Confirm Password'}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type={showRegConfirmPassword ? 'text' : 'password'}
                      value={regConfirmPassword}
                      onChange={(e) => setRegConfirmPassword(e.target.value)}
                      disabled={isLoading}
                      className={`block w-full pl-11 pr-12 py-3.5 bg-gray-50 border ${
                        regErrors.confirmPassword ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-indigo-500 focus:ring-indigo-500/20'
                      } rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-4 transition-all duration-200 disabled:opacity-50`}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
                    >
                      {showRegConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  {regErrors.confirmPassword && <p className="text-red-500 text-xs ml-1 font-medium">{regErrors.confirmPassword}</p>}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
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
                        {language === 'vi' ? 'Đăng ký' : 'Register'}
                        <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </span>
                </button>
              </form>
            )}

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
                      disabled={isLoading}
                      className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-all duration-200 group text-left disabled:opacity-50"
                    >
                      <div className="w-10 h-10 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-sm group-hover:scale-110 transition-transform">
                        {account.name.split(' ').pop()?.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-gray-900 text-sm truncate">{account.name}</div>
                        <div className="text-xs text-gray-500 truncate">{account.email || account.phone}</div>
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

