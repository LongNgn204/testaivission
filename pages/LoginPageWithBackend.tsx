/**
 * =================================================================
 * 🔐 LoginPage - Đăng nhập với Backend Verification
 * =================================================================
 *
 * MỤC ĐÍCH:
 * - Cho phép người dùng đăng nhập với xác thực backend.
 * - Gửi thông tin đến backend API để xác minh.
 * - Lưu token xác thực từ backend.
 * - Hiển thị danh sách tài khoản đã đăng nhập trước đó.
 */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, User, Phone, Calendar, LogIn, Zap, ChevronRight, Loader } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { loginUser, saveAuthToken, LoginRequest } from '../services/authService';
import { getSyncService } from '../services/syncService';

interface UserData {
  name: string;
  age: string;
  phone: string;
  loginTime: number;
}

// Không còn demo accounts - người dùng phải đăng ký/đăng nhập thật
const SAVED_ACCOUNTS_KEY = 'saved_accounts';

export default function LoginPageWithBackend() {
  const { language, t } = useLanguage();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [phone, setPhone] = useState('');
  const [errors, setErrors] = useState<{ name?: string; age?: string; phone?: string }>({});
  const [savedAccounts, setSavedAccounts] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  // Load saved accounts on mount
  React.useEffect(() => {
    const saved = localStorage.getItem(SAVED_ACCOUNTS_KEY);
    if (saved) {
      try {
        const accounts = JSON.parse(saved);
        setSavedAccounts(accounts.slice(0, 5));
      } catch (error) {
        console.error('Failed to load saved accounts:', error);
      }
    }
  }, []);

  // Save account to history
  const saveAccountToHistory = (userData: UserData) => {
    try {
      const saved = localStorage.getItem(SAVED_ACCOUNTS_KEY);
      let accounts: UserData[] = saved ? JSON.parse(saved) : [];
      accounts = accounts.filter(acc => acc.phone !== userData.phone);
      accounts.unshift(userData);
      accounts = accounts.slice(0, 5);
      localStorage.setItem(SAVED_ACCOUNTS_KEY, JSON.stringify(accounts));
    } catch (error) {
      console.error('Failed to save account history:', error);
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: { name?: string; age?: string; phone?: string } = {};

    if (!name.trim()) {
      newErrors.name = language === 'vi' ? 'Vui lòng nhập tên' : 'Please enter your name';
    } else if (name.trim().length < 2) {
      newErrors.name = language === 'vi' ? 'Tên phải có ít nhất 2 ký tự' : 'Name must be at least 2 characters';
    }

    if (!age.trim()) {
      newErrors.age = language === 'vi' ? 'Vui lòng nhập tuổi' : 'Please enter your age';
    } else if (isNaN(Number(age)) || Number(age) < 5 || Number(age) > 120) {
      newErrors.age = language === 'vi' ? 'Tuổi phải từ 5-120' : 'Age must be between 5-120';
    }

    if (!phone.trim()) {
      newErrors.phone = language === 'vi' ? 'Vui lòng nhập số điện thoại' : 'Please enter phone number';
    } else if (!/^0\d{9,10}$/.test(phone.trim())) {
      newErrors.phone = language === 'vi' ? 'Số điện thoại không hợp lệ (VD: 0912345678)' : 'Invalid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateField = (field: 'name' | 'age' | 'phone', value: string) => {
    const newErrors: { name?: string; age?: string; phone?: string } = { ...errors };
    if (field === 'name') {
      if (!value.trim()) newErrors.name = language === 'vi' ? 'Vui lòng nhập tên' : 'Please enter your name';
      else if (value.trim().length < 2) newErrors.name = language === 'vi' ? 'Tên phải có ít nhất 2 ký tự' : 'Name must be at least 2 characters';
      else delete newErrors.name;
    }
    if (field === 'age') {
      if (!value.trim()) newErrors.age = language === 'vi' ? 'Vui lòng nhập tuổi' : 'Please enter your age';
      else if (isNaN(Number(value)) || Number(value) < 5 || Number(value) > 120) newErrors.age = language === 'vi' ? 'Tuổi phải từ 5-120' : 'Age must be between 5-120';
      else delete newErrors.age;
    }
    if (field === 'phone') {
      const clean = value.trim();
      if (!clean) newErrors.phone = language === 'vi' ? 'Vui lòng nhập số điện thoại' : 'Please enter phone number';
      else if (!/^0\d{9,10}$/.test(clean)) newErrors.phone = language === 'vi' ? 'Số điện thoại không hợp lệ (VD: 0912345678)' : 'Invalid phone number';
      else delete newErrors.phone;
    }
    setErrors(newErrors);
  };

  // Handle login with backend verification
  const handleLogin = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    setApiError('');

    // Timeout guard (30s)
    const timeoutId = setTimeout(() => {
      setIsLoading(false);
      setApiError('Request timeout. Please check your internet or backend server.');
    }, 30000);

    try {
      const credentials: LoginRequest = {
        name: name.trim(),
        age: age.trim(),
        phone: phone.trim(),
      };

      const response = await loginUser(credentials);

      if (response.success && response.user) {
        // Save token
        saveAuthToken(response.user.token);

        // Save user data
        const userData: UserData = {
          name: response.user.name,
          age: response.user.age,
          phone: response.user.phone,
          loginTime: response.user.loginTime,
        };

        saveAccountToHistory(userData);
        localStorage.setItem('user_data', JSON.stringify(userData));

        // Dispatch event
        window.dispatchEvent(new Event('userLoggedIn'));

        // Trigger sync after login
        try {
          const syncService = getSyncService();
          await syncService.fullSync();
          console.log('Sync completed after login');
        } catch (syncError) {
          console.warn('Sync failed after login:', syncError);
        }

        // Navigate
        navigate('/home');
      } else {
        setApiError(response.error || response.message || 'Login failed');
        setErrors({ name: response.error || response.message });
      }
    } catch (error: any) {
      setApiError(error.message || 'An error occurred');
      setErrors({ name: error.message });
    } finally {
      clearTimeout(timeoutId);
      setIsLoading(false);
    }
  };

  // Handle register/login - Backend tự động tạo user mới nếu chưa tồn tại
  const handleRegister = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    setApiError('');

    try {
      // Backend tự động tạo user mới nếu chưa tồn tại (dựa trên phone)
      const credentials: LoginRequest = {
        name: name.trim(),
        age: age.trim(),
        phone: phone.trim(),
      };

      const response = await loginUser(credentials);

      if (response.success && response.user) {
        // Save token
        saveAuthToken(response.user.token);

        // Save user data
        const userData: UserData = {
          name: response.user.name,
          age: response.user.age,
          phone: response.user.phone,
          loginTime: response.user.loginTime,
        };

        saveAccountToHistory(userData);
        localStorage.setItem('user_data', JSON.stringify(userData));

        // Dispatch event
        window.dispatchEvent(new Event('userLoggedIn'));

        // Trigger sync after register/login
        try {
          const syncService = getSyncService();
          await syncService.fullSync();
          console.log('Sync completed after register/login');
        } catch (syncError) {
          console.warn('Sync failed after register/login:', syncError);
        }

        // Navigate
        navigate('/home');
      } else {
        setApiError(response.error || response.message || 'Đăng ký/Đăng nhập thất bại');
        setErrors({ name: response.error || response.message });
      }
    } catch (error: any) {
      setApiError(error.message || 'Có lỗi xảy ra');
      setErrors({ name: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle saved account login
  const handleSavedAccountLogin = async (account: UserData) => {
    setIsLoading(true);
    setApiError('');

    try {
      const response = await loginUser({
        name: account.name,
        age: account.age,
        phone: account.phone,
      });

      if (response.success && response.user) {
        saveAuthToken(response.user.token);

        const userData: UserData = {
          ...account,
          loginTime: response.user.loginTime,
        };

        saveAccountToHistory(userData);
        localStorage.setItem('user_data', JSON.stringify(userData));
        window.dispatchEvent(new Event('userLoggedIn'));

        // Trigger sync after saved account login
        try {
          const syncService = getSyncService();
          await syncService.fullSync();
          console.log('Sync completed after saved account login');
        } catch (syncError) {
          console.warn('Sync failed after saved account login:', syncError);
        }

        navigate('/home');
      } else {
        setApiError(response.error || 'Login failed');
      }
    } catch (error: any) {
      setApiError(error.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

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
                <Zap size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">
                  {language === 'vi' ? 'Đăng nhập An toàn' : 'Secure Login'}
                </h3>
                <p className="text-sm text-gray-500">
                  {language === 'vi' ? 'Xác thực được xác minh bởi backend' : 'Backend verified authentication'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-white/50 shadow-sm">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600">
                <Calendar size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">
                  {language === 'vi' ? 'Theo dõi Thông minh' : 'Smart Tracking'}
                </h3>
                <p className="text-sm text-gray-500">
                  {language === 'vi' ? 'Theo dõi tiến độ hàng ngày' : 'Monitor progress daily'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Login Form */}
        <div className="animate-fade-in-up">
          <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-2xl shadow-indigo-100/50 p-8 md:p-10 border border-white/50">

            {/* Mobile Header */}
            <div className="lg:hidden text-center mb-8">
              <div className="inline-flex w-14 h-14 bg-indigo-50 rounded-2xl items-center justify-center mb-4">
                <Eye className="w-7 h-7 text-indigo-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">{t('login_title')}</h2>
              <p className="text-gray-500 text-sm mt-1">{t('login_subtitle')}</p>
            </div>

            <div className="hidden lg:block mb-8">
              <h2 className="text-2xl font-bold text-gray-900">{t('login_title')}</h2>
              <p className="text-gray-500 text-sm mt-1">{t('login_subtitle')}</p>
            </div>

            {/* API Error Alert */}
            {apiError && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-red-700 text-sm font-medium">⚠️ {apiError}</p>
                <p className="text-red-600 text-xs mt-1">
                  {language === 'vi'
                    ? 'Đảm bảo Cloudflare Worker đang chạy trên http://localhost:8787'
                    : 'Make sure the Cloudflare Worker is running on http://localhost:8787'}
                </p>
              </div>
            )}

            <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }} className="space-y-5">
              {/* Note: Backend tự động tạo user mới nếu chưa tồn tại (dựa trên phone) */}
              {/* Name Input */}
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700 ml-1">
                  {t('name_label')}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => { setName(e.target.value); validateField('name', e.target.value); }}
                    disabled={isLoading}
                    className={`block w-full pl-11 pr-4 py-3.5 bg-gray-50 border ${errors.name ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-indigo-500 focus:ring-indigo-500/20'} rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-4 transition-all duration-200 disabled:opacity-50`}
                    placeholder="Nguyen Van A"
                  />
                </div>
                {errors.name && <p className="text-red-500 text-xs ml-1 font-medium">{errors.name}</p>}
              </div>

              {/* Age & Phone Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700 ml-1">
                    {t('age_label')}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Calendar className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="number"
                      value={age}
                      onChange={(e) => { setAge(e.target.value); validateField('age', e.target.value); }}
                      disabled={isLoading}
                      className={`block w-full pl-11 pr-4 py-3.5 bg-gray-50 border ${errors.age ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-indigo-500 focus:ring-indigo-500/20'} rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-4 transition-all duration-200 disabled:opacity-50`}
                      placeholder="25"
                      min="5"
                      max="120"
                    />
                  </div>
                  {errors.age && <p className="text-red-500 text-xs ml-1 font-medium">{errors.age}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700 ml-1">
                    {t('phone_label')}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Phone className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => { setPhone(e.target.value); validateField('phone', e.target.value); }}
                      disabled={isLoading}
                      className={`block w-full pl-11 pr-4 py-3.5 bg-gray-50 border ${errors.phone ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-indigo-500 focus:ring-indigo-500/20'} rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-4 transition-all duration-200 disabled:opacity-50`}
                      placeholder="0912..."
                    />
                  </div>
                  {errors.phone && <p className="text-red-500 text-xs ml-1 font-medium">{errors.phone}</p>}
                </div>
              </div>

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
                      {language === 'vi' ? 'Đăng nhập / Đăng ký' : 'Login / Register'}
                      <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </span>
              </button>
              <p className="text-xs text-gray-500 text-center mt-2">
                {language === 'vi'
                  ? '💡 Hệ thống tự động tạo tài khoản mới nếu số điện thoại chưa được đăng ký'
                  : '💡 System will automatically create a new account if phone number is not registered'}
              </p>
            </form>

            {/* Saved Accounts */}
            {savedAccounts.length > 0 && (
              <div className="mt-8 pt-6 border-t border-gray-100">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 text-center">
                  {t('saved_accounts_title')}
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
                        <div className="text-xs text-gray-500 truncate">{account.phone}</div>
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

