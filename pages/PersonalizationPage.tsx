import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Palette, Layout, Type, Sparkles, Check } from 'lucide-react';

interface PersonalizationSettings {
  theme: string;
  layout: 'card' | 'list';
  fontSize: 'small' | 'medium' | 'large';
  avatar: string;
}

const THEMES = [
  { id: 'default', name: 'Default', nameVi: 'Mặc định', colors: ['from-blue-500', 'to-indigo-600'] },
  { id: 'ocean', name: 'Ocean', nameVi: 'Đại dương', colors: ['from-cyan-500', 'to-blue-600'] },
  { id: 'forest', name: 'Forest', nameVi: 'Rừng xanh', colors: ['from-green-500', 'to-emerald-600'] },
  { id: 'sunset', name: 'Sunset', nameVi: 'Hoàng hôn', colors: ['from-orange-500', 'to-red-600'] },
  { id: 'lavender', name: 'Lavender', nameVi: 'Oải hương', colors: ['from-purple-500', 'to-pink-600'] },
  { id: 'rose', name: 'Rose Gold', nameVi: 'Vàng hồng', colors: ['from-pink-400', 'to-rose-600'] },
  { id: 'mint', name: 'Mint', nameVi: 'Bạc hà', colors: ['from-teal-400', 'to-cyan-500'] },
  { id: 'autumn', name: 'Autumn', nameVi: 'Thu vàng', colors: ['from-yellow-500', 'to-orange-600'] },
  { id: 'night', name: 'Night Sky', nameVi: 'Bầu trời đêm', colors: ['from-indigo-900', 'to-purple-900'] },
  { id: 'sakura', name: 'Sakura', nameVi: 'Hoa anh đào', colors: ['from-pink-300', 'to-rose-400'] },
];

const AVATARS = [
  { id: 'owl', emoji: '🦉', name: 'Wise Owl', nameVi: 'Cú mèo thông thái' },
  { id: 'cat', emoji: '🐱', name: 'Sharp Cat', nameVi: 'Mèo tinh tường' },
  { id: 'robot', emoji: '🤖', name: 'Tech Robot', nameVi: 'Robot công nghệ' },
  { id: 'eagle', emoji: '🦅', name: 'Eagle Eye', nameVi: 'Mắt đại bàng' },
  { id: 'fox', emoji: '🦊', name: 'Clever Fox', nameVi: 'Cáo khôn ngoan' },
  { id: 'panda', emoji: '🐼', name: 'Cute Panda', nameVi: 'Gấu trúc dễ thương' },
  { id: 'lion', emoji: '🦁', name: 'Brave Lion', nameVi: 'Sư tử dũng cảm' },
  { id: 'unicorn', emoji: '🦄', name: 'Magic Unicorn', nameVi: 'Kỳ lân phép thuật' },
];

const STORAGE_KEY = 'personalization_settings';

export default function PersonalizationPage() {
  const { language, t } = useLanguage();
  const [settings, setSettings] = useState<PersonalizationSettings>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : {
      theme: 'default',
      layout: 'card',
      fontSize: 'medium',
      avatar: 'owl',
    };
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    
    // Apply theme to body
    document.body.classList.remove(...THEMES.map(t => `theme-${t.id}`));
    document.body.classList.add(`theme-${settings.theme}`);
    
    // Apply font size
    document.documentElement.style.fontSize = 
      settings.fontSize === 'small' ? '14px' : 
      settings.fontSize === 'large' ? '18px' : '16px';
  }, [settings]);

  const updateSetting = <K extends keyof PersonalizationSettings>(
    key: K,
    value: PersonalizationSettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const selectedAvatar = AVATARS.find(a => a.id === settings.avatar) || AVATARS[0];
  const selectedTheme = THEMES.find(t => t.id === settings.theme) || THEMES[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-slate-900 dark:to-gray-900 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-block mb-4">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-4xl animate-bounce">
              {selectedAvatar.emoji}
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-3">
            {language === 'vi' ? '🎨 Cá Nhân Hóa' : '🎨 Personalization'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {language === 'vi' 
              ? 'Tùy chỉnh giao diện theo phong cách riêng của bạn' 
              : 'Customize the interface to match your style'}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Theme Selection */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                <Palette className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                  {language === 'vi' ? 'Chủ đề màu' : 'Color Theme'}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {language === 'vi' ? 'Chọn bảng màu yêu thích' : 'Choose your favorite color palette'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {THEMES.map(theme => (
                <button
                  key={theme.id}
                  onClick={() => updateSetting('theme', theme.id)}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    settings.theme === theme.id
                      ? 'border-purple-500 shadow-lg scale-105'
                      : 'border-gray-200 dark:border-gray-700 hover:border-purple-300'
                  }`}
                >
                  <div className={`w-full h-12 bg-gradient-to-r ${theme.colors.join(' ')} rounded-lg mb-2`}></div>
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {language === 'vi' ? theme.nameVi : theme.name}
                  </p>
                  {settings.theme === theme.id && (
                    <Check className="w-5 h-5 text-purple-500 mx-auto mt-1" />
                  )}
                </button>
              ))}
            </div>

            <div className="mt-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <strong>{language === 'vi' ? 'Đang áp dụng:' : 'Current theme:'}</strong> {language === 'vi' ? selectedTheme.nameVi : selectedTheme.name}
              </p>
            </div>
          </div>

          {/* Avatar Selection */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                  {language === 'vi' ? 'Linh vật' : 'Avatar Mascot'}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {language === 'vi' ? 'Chọn người bạn đồng hành' : 'Choose your companion'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {AVATARS.map(avatar => (
                <button
                  key={avatar.id}
                  onClick={() => updateSetting('avatar', avatar.id)}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    settings.avatar === avatar.id
                      ? 'border-blue-500 shadow-lg scale-110'
                      : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
                  }`}
                >
                  <div className="text-4xl mb-2">{avatar.emoji}</div>
                  <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                    {language === 'vi' ? avatar.nameVi : avatar.name}
                  </p>
                  {settings.avatar === avatar.id && (
                    <Check className="w-4 h-4 text-blue-500 mx-auto mt-1" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Layout Preference */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                <Layout className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                  {language === 'vi' ? 'Bố cục' : 'Layout'}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {language === 'vi' ? 'Cách hiển thị nội dung' : 'Content display style'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => updateSetting('layout', 'card')}
                className={`p-6 rounded-xl border-2 transition-all ${
                  settings.layout === 'card'
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-green-300'
                }`}
              >
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded"></div>
                  <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded"></div>
                  <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded"></div>
                  <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded"></div>
                </div>
                <p className="font-semibold text-gray-700 dark:text-gray-300">
                  {language === 'vi' ? 'Lưới' : 'Card Grid'}
                </p>
                {settings.layout === 'card' && <Check className="w-5 h-5 text-green-500 mx-auto mt-2" />}
              </button>

              <button
                onClick={() => updateSetting('layout', 'list')}
                className={`p-6 rounded-xl border-2 transition-all ${
                  settings.layout === 'list'
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-green-300'
                }`}
              >
                <div className="space-y-2 mb-3">
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
                </div>
                <p className="font-semibold text-gray-700 dark:text-gray-300">
                  {language === 'vi' ? 'Danh sách' : 'List View'}
                </p>
                {settings.layout === 'list' && <Check className="w-5 h-5 text-green-500 mx-auto mt-2" />}
              </button>
            </div>
          </div>

          {/* Font Size */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
                <Type className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                  {language === 'vi' ? 'Cỡ chữ' : 'Font Size'}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {language === 'vi' ? 'Dễ đọc hơn cho mắt' : 'Easier on your eyes'}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {(['small', 'medium', 'large'] as const).map(size => (
                <button
                  key={size}
                  onClick={() => updateSetting('fontSize', size)}
                  className={`w-full p-4 rounded-xl border-2 transition-all flex items-center justify-between ${
                    settings.fontSize === size
                      ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-orange-300'
                  }`}
                >
                  <span className={`font-semibold text-gray-700 dark:text-gray-300 ${
                    size === 'small' ? 'text-sm' : size === 'large' ? 'text-xl' : 'text-base'
                  }`}>
                    {size === 'small' ? 'A' : size === 'large' ? 'A++' : 'A+'}
                  </span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {language === 'vi' 
                      ? (size === 'small' ? 'Nhỏ' : size === 'large' ? 'Lớn' : 'Trung bình')
                      : (size === 'small' ? 'Small' : size === 'large' ? 'Large' : 'Medium')}
                  </span>
                  {settings.fontSize === size && <Check className="w-5 h-5 text-orange-500" />}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Preview Card */}
        <div className="mt-8 bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 rounded-2xl shadow-2xl p-8 text-white">
          <div className="flex items-center gap-4 mb-4">
            <div className="text-6xl">{selectedAvatar.emoji}</div>
            <div>
              <h3 className="text-2xl font-bold">
                {language === 'vi' ? 'Xem trước cá nhân hóa' : 'Personalization Preview'}
              </h3>
              <p className="opacity-90">
                {language === 'vi' 
                  ? `Chủ đề: ${selectedTheme.nameVi} • Linh vật: ${selectedAvatar.nameVi}`
                  : `Theme: ${selectedTheme.name} • Mascot: ${selectedAvatar.name}`}
              </p>
            </div>
          </div>
          <p className="text-lg opacity-90">
            {language === 'vi'
              ? 'Các tùy chỉnh của bạn đã được lưu và sẽ được áp dụng trên toàn bộ ứng dụng! 🎉'
              : 'Your customizations have been saved and will be applied throughout the app! 🎉'}
          </p>
        </div>
      </div>
    </div>
  );
}
