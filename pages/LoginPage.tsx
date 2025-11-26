/**
 * =================================================================
 * 🔐 LoginPage - Đăng nhập & đồng bộ trạng thái xác thực
 * =================================================================
 *
 * MỤC ĐÍCH:
 * - Cho phép người dùng đăng nhập nhanh (demo hoặc nhập thông tin).
 * - Lưu thông tin người dùng vào localStorage ('user_data').
 * - Phát sự kiện tuỳ chỉnh 'userLoggedIn' để App.tsx lắng nghe và cập nhật guard.
 * - Hiển thị danh sách tài khoản đã đăng nhập trước đó để chọn nhanh.
 */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, User, Phone, Calendar, LogIn, Zap, ChevronRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface UserData {
  name: string;
  age: string;
  phone: string;
  loginTime: number;
}

// Một vài tài khoản demo để thử nhanh (không cần nhập form)
const DEMO_ACCOUNTS = [
  { name: 'Nguyễn Văn An', age: '28', phone: '0912345678' },
  { name: 'Trần Thị Bình', age: '35', phone: '0987654321' },
  { name: 'Lê Minh Công', age: '42', phone: '0901234567' },
];

// Key lưu cache danh sách tài khoản đã đăng nhập
const SAVED_ACCOUNTS_KEY = 'saved_accounts';

export default function LoginPage() {
  const { language, t } = useLanguage();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [phone, setPhone] = useState('');
  const [errors, setErrors] = useState<{ name?: string; age?: string; phone?: string }>({});
  const [savedAccounts, setSavedAccounts] = useState<UserData[]>([]);

  // Tải danh sách tài khoản đã lưu từ localStorage
  React.useEffect(() => {
    const saved = localStorage.getItem(SAVED_ACCOUNTS_KEY);
    if (saved) {
      try {
        const accounts = JSON.parse(saved);
        setSavedAccounts(accounts.slice(0, 5)); // tối đa 5 tài khoản gần nhất
      } catch (error) {
        console.error('Failed to load saved accounts:', error);
      }
    }
  }, []);

  // Lưu/đẩy tài khoản lên đầu danh sách, tối đa 5 mục
  const saveAccountToHistory = (userData: UserData) => {
    try {
      const saved = localStorage.getItem(SAVED_ACCOUNTS_KEY);
      let accounts: UserData[] = saved ? JSON.parse(saved) : [];

      // Loại bỏ trùng theo số điện thoại
      accounts = accounts.filter(acc => acc.phone !== userData.phone);

      // Thêm lên đầu danh sách
      accounts.unshift(userData);

      // Giới hạn tối đa 5 tài khoản
      accounts = accounts.slice(0, 5);

      localStorage.setItem(SAVED_ACCOUNTS_KEY, JSON.stringify(accounts));
    } catch (error) {
      console.error('Failed to save account history:', error);
    }
  };

  // Validate form (tối giản, có thể mở rộng)
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

  // Đăng nhập bằng form nhập tay
  const handleLogin = () => {
    if (!validateForm()) return;

    const userData: UserData = {
      name: name.trim(),
      age: age.trim(),
      phone: phone.trim(),
      loginTime: Date.now(),
    };

    saveAccountToHistory(userData);
    localStorage.setItem('user_data', JSON.stringify(userData));

    // Phát sự kiện để App.tsx (AppContent) đồng bộ guard
    window.dispatchEvent(new Event('userLoggedIn'));

    navigate('/home');
  };

  // Đăng nhập nhanh bằng tài khoản demo
  const handleDemoLogin = (demo: typeof DEMO_ACCOUNTS[0]) => {
    const userData: UserData = {
      name: demo.name,
      age: demo.age,
      phone: demo.phone,
      loginTime: Date.now(),
    };

    saveAccountToHistory(userData);
    localStorage.setItem('user_data', JSON.stringify(userData));

    window.dispatchEvent(new Event('userLoggedIn'));
    navigate('/home');
  };

  // Đăng nhập lại bằng tài khoản đã lưu
  const handleSavedAccountLogin = (account: UserData) => {
    const userData: UserData = {
      ...account,
      loginTime: Date.now(),
    };

    saveAccountToHistory(userData);
    localStorage.setItem('user_data', JSON.stringify(userData));

    window.dispatchEvent(new Event('userLoggedIn'));
    navigate('/home');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4 font-sans relative overflow-hidden">
      {/* Abstract Background Shapes */}
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-100/40 rounded-full blur-3xl animate-blob"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-100/40 rounded-full blur-3xl animate-blob animation-delay-2000"></div>

      <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-2 gap-8 z-10">

        {/* Left Column: Welcome & Info (Desktop only) */}
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
                <h3 className="font-semibold text-gray-900">AI Analysis</h3>
                <p className="text-sm text-gray-500">Instant health insights</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-white/50 shadow-sm">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600">
                <Calendar size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Smart Tracking</h3>
                <p className="text-sm text-gray-500">Monitor progress daily</p>
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
              <p className="text-gray-500 text-sm mt-1">Enter your details to access your dashboard</p>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }} className="space-y-5">
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
                    onChange={(e) => setName(e.target.value)}
                    className={`block w-full pl-11 pr-4 py-3.5 bg-gray-50 border ${errors.name ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-indigo-500 focus:ring-indigo-500/20'} rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-4 transition-all duration-200`}
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
                      onChange={(e) => setAge(e.target.value)}
                      className={`block w-full pl-11 pr-4 py-3.5 bg-gray-50 border ${errors.age ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-indigo-500 focus:ring-indigo-500/20'} rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-4 transition-all duration-200`}
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
                      onChange={(e) => setPhone(e.target.value)}
                      className={`block w-full pl-11 pr-4 py-3.5 bg-gray-50 border ${errors.phone ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-indigo-500 focus:ring-indigo-500/20'} rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-4 transition-all duration-200`}
                      placeholder="0912..."
                    />
                  </div>
                  {errors.phone && <p className="text-red-500 text-xs ml-1 font-medium">{errors.phone}</p>}
                </div>
              </div>

              <button
                type="submit"
                className="w-full relative group bg-gray-900 text-white font-bold py-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {t('login_button_submit')}
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </button>
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
                      className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-all duration-200 group text-left"
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

            {/* Demo Accounts */}
            <div className="mt-6 pt-6 border-t border-gray-100">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 text-center">
                {t('or_use_demo')}
              </p>
              <div className="grid grid-cols-3 gap-2">
                {DEMO_ACCOUNTS.map((demo, index) => (
                  <button
                    key={index}
                    onClick={() => handleDemoLogin(demo)}
                    className="flex flex-col items-center justify-center p-3 rounded-xl border border-gray-100 hover:border-indigo-200 hover:bg-indigo-50/50 transition-all duration-200"
                  >
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-xs font-bold text-gray-600 mb-2">
                      {demo.name.split(' ').pop()?.charAt(0)}
                    </div>
                    <span className="text-xs font-medium text-gray-700 truncate w-full text-center">{demo.name.split(' ').pop()}</span>
                  </button>
                ))}
              </div>
            </div>

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
/* Reduce Motion: tắt/giảm animation cho người dùng nhạy cảm chuyển động */
@media (prefers-reduced-motion: reduce) {
  .animate-blob, .animate-fade-in-up { animation: none !important; }
}
`}</style>
    </div>
  );
}