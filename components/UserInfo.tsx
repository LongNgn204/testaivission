import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Phone, Calendar, LogOut, Edit, X, Check } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface UserData {
  name: string;
  age: string;
  phone: string;
  loginTime: number;
}

interface UserInfoProps {
  showLoginButton?: boolean;
}

export const UserInfo: React.FC<UserInfoProps> = ({ showLoginButton = true }) => {
  const { language, t } = useLanguage();
  const navigate = useNavigate();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editAge, setEditAge] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = () => {
    const data = localStorage.getItem('user_data');
    if (data) {
      const parsed = JSON.parse(data);
      setUserData(parsed);
      setEditName(parsed.name);
      setEditAge(parsed.age);
      setEditPhone(parsed.phone);
    }
  };

  const handleLogout = () => {
    if (window.confirm(t('logout_confirm'))) {
      localStorage.removeItem('user_data');
      
      // Dispatch custom event to notify app of logout
      window.dispatchEvent(new Event('userLoggedOut'));
      
      navigate('/');
    }
  };

  const handleSaveEdit = () => {
    if (!editName.trim() || !editAge.trim() || !editPhone.trim()) {
      alert(language === 'vi' ? 'Vui lòng điền đầy đủ thông tin' : 'Please fill all fields');
      return;
    }

    const updatedData: UserData = {
      name: editName.trim(),
      age: editAge.trim(),
      phone: editPhone.trim(),
      loginTime: userData?.loginTime || Date.now(),
    };

    localStorage.setItem('user_data', JSON.stringify(updatedData));
    setUserData(updatedData);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    if (userData) {
      setEditName(userData.name);
      setEditAge(userData.age);
      setEditPhone(userData.phone);
    }
    setIsEditing(false);
  };

  // Show login button if not logged in
  if (!userData) {
    if (!showLoginButton) return null;
    
    return (
      <button
        onClick={() => navigate('/login')}
        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
      >
        <User className="w-5 h-5" />
        <span className="hidden md:inline">
          {t('login_button')}
        </span>
      </button>
    );
  }

  return (
    <div className="relative">
      {/* User Button */}
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 hover:from-blue-100 hover:to-indigo-100 dark:hover:from-blue-900/50 dark:hover:to-indigo-900/50 transition-all duration-200 border border-blue-100 dark:border-blue-800/50"
      >
        <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-md">
          <User className="w-5 h-5 text-white" />
        </div>
        <div className="hidden md:block text-left">
          <div className="text-sm font-bold text-gray-800 dark:text-white leading-tight">{userData.name.split(' ').slice(-2).join(' ')}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">{userData.phone.slice(0, 4)}****</div>
        </div>
      </button>

      {/* Dropdown Menu */}
      {showDropdown && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setShowDropdown(false)}
          ></div>
          <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 z-20 overflow-hidden animate-fade-in">
            {!isEditing ? (
              <>
                {/* User Info Display */}
                <div className="p-6 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border-2 border-white/30">
                      <User className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1 text-white">
                      <div className="text-lg font-bold mb-1">{userData.name}</div>
                      <div className="text-xs opacity-90 flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-white/20 rounded-full">
                          {t('member_since')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 space-y-2">
                  <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-700 rounded-xl">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                        {t('age_label')}
                      </div>
                      <div className="font-bold text-gray-800 dark:text-white">
                        {userData.age} {t('years_old')}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-gray-700 dark:to-gray-700 rounded-xl">
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900/50 rounded-lg flex items-center justify-center">
                      <Phone className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                        {t('phone_label')}
                      </div>
                      <div className="font-bold text-gray-800 dark:text-white">{userData.phone}</div>
                    </div>
                  </div>
                </div>

                <div className="p-4 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex flex-col gap-2">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600 rounded-xl font-semibold transition-all text-gray-700 dark:text-gray-200"
                    >
                      <Edit className="w-4 h-4" />
                      {t('edit_profile')}
                    </button>
                    <button
                      onClick={handleLogout}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl"
                    >
                      <LogOut className="w-4 h-4" />
                      {t('logout')}
                    </button>
                  </div>
                  <button
                    onClick={() => {
                      setShowDropdown(false);
                      navigate('/login');
                    }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl"
                  >
                    <User className="w-4 h-4" />
                    {t('switch_account')}
                  </button>
                </div>
              </>
            ) : (
              <>
                {/* Edit Mode */}
                <div className="p-6 bg-gradient-to-br from-purple-500 via-pink-500 to-rose-500">
                  <div className="flex items-center gap-3 text-white">
                    <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                      <Edit className="w-5 h-5" />
                    </div>
                    <div className="text-lg font-bold">
                      {t('edit_profile_title')}
                    </div>
                  </div>
                </div>

                <div className="p-5 space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                      <User className="w-4 h-4" />
                      {t('name_label')}
                    </label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                      placeholder={t('form_name_placeholder')}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {t('age_label')}
                    </label>
                    <input
                      type="number"
                      value={editAge}
                      onChange={(e) => setEditAge(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                      min="5"
                      max="120"
                      placeholder="25"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      {t('phone_label')}
                    </label>
                    <input
                      type="tel"
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                      placeholder="0912345678"
                    />
                  </div>
                </div>

                <div className="p-4 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex gap-2">
                  <button
                    onClick={handleCancelEdit}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600 rounded-xl font-semibold transition-all text-gray-700 dark:text-gray-200"
                  >
                    <X className="w-4 h-4" />
                    {t('cancel')}
                  </button>
                  <button
                    onClick={handleSaveEdit}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl"
                  >
                    <Check className="w-4 h-4" />
                    {t('save_changes')}
                  </button>
                </div>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
};