import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, User, Phone, Calendar, LogIn, Zap } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface UserData {
  name: string;
  age: string;
  phone: string;
  loginTime: number;
}

const DEMO_ACCOUNTS = [
  { name: 'Nguyễn Văn An', age: '28', phone: '0912345678' },
  { name: 'Trần Thị Bình', age: '35', phone: '0987654321' },
  { name: 'Lê Minh Công', age: '42', phone: '0901234567' },
];

const SAVED_ACCOUNTS_KEY = 'saved_accounts';

export default function LoginPage() {
  const { language, t } = useLanguage();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [phone, setPhone] = useState('');
  const [errors, setErrors] = useState<{ name?: string; age?: string; phone?: string }>({});
  const [savedAccounts, setSavedAccounts] = useState<UserData[]>([]);

  // Load saved accounts
  React.useEffect(() => {
    const saved = localStorage.getItem(SAVED_ACCOUNTS_KEY);
    if (saved) {
      try {
        const accounts = JSON.parse(saved);
        setSavedAccounts(accounts.slice(0, 5)); // Show max 5 saved accounts
      } catch (error) {
        console.error('Failed to load saved accounts:', error);
      }
    }
  }, []);

  // Allow users to always access login page (for switching accounts)

  const saveAccountToHistory = (userData: UserData) => {
    try {
      const saved = localStorage.getItem(SAVED_ACCOUNTS_KEY);
      let accounts: UserData[] = saved ? JSON.parse(saved) : [];
      
      // Remove duplicate if exists
      accounts = accounts.filter(acc => acc.phone !== userData.phone);
      
      // Add to front
      accounts.unshift(userData);
      
      // Keep max 5 accounts
      accounts = accounts.slice(0, 5);
      
      localStorage.setItem(SAVED_ACCOUNTS_KEY, JSON.stringify(accounts));
    } catch (error) {
      console.error('Failed to save account history:', error);
    }
  };

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
    
    // Dispatch custom event to notify app of login
    window.dispatchEvent(new Event('userLoggedIn'));
    
    navigate('/home');
  };

  const handleDemoLogin = (demo: typeof DEMO_ACCOUNTS[0]) => {
    const userData: UserData = {
      name: demo.name,
      age: demo.age,
      phone: demo.phone,
      loginTime: Date.now(),
    };

    saveAccountToHistory(userData);
    localStorage.setItem('user_data', JSON.stringify(userData));
    
    // Dispatch custom event to notify app of login
    window.dispatchEvent(new Event('userLoggedIn'));
    
    navigate('/home');
  };

  const handleSavedAccountLogin = (account: UserData) => {
    const userData: UserData = {
      ...account,
      loginTime: Date.now(),
    };

    saveAccountToHistory(userData);
    localStorage.setItem('user_data', JSON.stringify(userData));
    
    // Dispatch custom event to notify app of login
    window.dispatchEvent(new Event('userLoggedIn'));
    
    navigate('/home');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-slate-900 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full animate-fade-in">
        {/* Login Form Card */}
        <div className="bg-white/80 dark:bg-gray-800/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-gray-200/50 dark:border-gray-700/50">
          {/* Header with gradient accent */}
          <div className="text-center mb-8">
            <div className="relative inline-block mb-4">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl blur-xl opacity-20"></div>
              <div className="relative bg-gradient-to-br from-blue-500 to-indigo-600 p-4 rounded-2xl">
                <Eye className="w-12 h-12 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-2">
              {t('login_title')}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              {t('login_subtitle')}
            </p>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }} className="space-y-5">
            {/* Name Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                <User className="w-4 h-4 inline mr-2" />
                {t('name_label')}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`w-full px-4 py-3 rounded-lg border ${
                  errors.name 
                    ? 'border-red-500 focus:ring-red-500' 
                    : 'border-gray-300 focus:ring-blue-500'
                } dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:border-transparent transition-all`}
                placeholder={t('form_name_placeholder')}
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>

            {/* Age Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                <Calendar className="w-4 h-4 inline mr-2" />
                {t('age_label')}
              </label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className={`w-full px-4 py-3 rounded-lg border ${
                  errors.age 
                    ? 'border-red-500 focus:ring-red-500' 
                    : 'border-gray-300 focus:ring-blue-500'
                } dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:border-transparent transition-all`}
                placeholder="25"
                min="5"
                max="120"
              />
              {errors.age && <p className="text-red-500 text-sm mt-1">{errors.age}</p>}
            </div>

            {/* Phone Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                <Phone className="w-4 h-4 inline mr-2" />
                {t('phone_label')}
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={`w-full px-4 py-3 rounded-lg border ${
                  errors.phone 
                    ? 'border-red-500 focus:ring-red-500' 
                    : 'border-gray-300 focus:ring-blue-500'
                } dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:border-transparent transition-all`}
                placeholder="0912345678"
              />
              {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full relative group bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-2xl overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <LogIn className="w-5 h-5 relative z-10" />
              <span className="relative z-10">{t('login_button_submit')}</span>
            </button>
          </form>

          {/* Saved Accounts */}
          {savedAccounts.length > 0 && (
            <div className="mt-8 pt-8 border-t border-gray-200/50 dark:border-gray-700/50">
              <div className="text-center mb-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center justify-center gap-2">
                  <User className="w-4 h-4 text-green-500" />
                  {t('saved_accounts_title')}
                </p>
              </div>
              
              <div className="flex flex-col gap-2">
                {savedAccounts.map((account, index) => (
                  <button
                    key={index}
                    onClick={() => handleSavedAccountLogin(account)}
                    className="w-full relative overflow-hidden bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 hover:from-green-100 hover:to-emerald-100 dark:hover:from-green-900/30 dark:hover:to-emerald-900/30 border border-green-200/80 dark:border-green-800/50 rounded-xl px-4 py-3.5 transition-all duration-300 group text-left shadow-sm hover:shadow-md"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-400 via-emerald-500 to-teal-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                        <span className="text-white font-bold text-sm">
                          {account.name.split(' ').pop()?.charAt(0)}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-gray-800 dark:text-white text-sm mb-0.5 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                          {account.name}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
                          <span className="inline-flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {account.age} {t('years_old')}
                          </span>
                          <span className="text-gray-300 dark:text-gray-600">•</span>
                          <span className="inline-flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {account.phone.slice(0, 4)}****
                          </span>
                        </div>
                      </div>
                      <div className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0 group-hover:bg-green-200 dark:group-hover:bg-green-900/50 transition-colors">
                        <LogIn className="w-4 h-4 text-green-600 dark:text-green-400" />
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Demo Login Buttons */}
          <div className="mt-8 pt-8 border-t border-gray-200/50 dark:border-gray-700/50">
            <div className="text-center mb-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center justify-center gap-2">
                <Zap className="w-4 h-4 text-amber-500" />
                {t('or_use_demo')}
              </p>
            </div>
            
            <div className="flex flex-col gap-3">
              {DEMO_ACCOUNTS.map((demo, index) => (
                <button
                  key={index}
                  onClick={() => handleDemoLogin(demo)}
                  className="w-full relative overflow-hidden bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 hover:from-blue-50 hover:to-indigo-50 dark:hover:from-gray-600 dark:hover:to-gray-500 border border-gray-200/80 dark:border-gray-600/80 rounded-xl px-4 py-3.5 transition-all duration-300 group text-left shadow-sm hover:shadow-md"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-400 via-indigo-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                      <span className="text-white font-bold text-sm">
                        {demo.name.split(' ').pop()?.charAt(0)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-800 dark:text-white text-sm mb-0.5 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {demo.name}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {demo.age} {language === 'vi' ? 'tuổi' : 'yrs'}
                        </span>
                        <span className="text-gray-300 dark:text-gray-600">•</span>
                        <span className="inline-flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {demo.phone.slice(0, 4)}****
                        </span>
                      </div>
                    </div>
                    <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50 transition-colors">
                      <LogIn className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Footer Note */}
          <div className="mt-6 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded-full">
              <span className="text-amber-600 dark:text-amber-400">💡</span>
              <p className="text-xs font-medium text-amber-700 dark:text-amber-300">
                {language === 'vi' 
                  ? 'Demo: Thử ngay không cần đăng ký' 
                  : 'Demo: Try without registration'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}