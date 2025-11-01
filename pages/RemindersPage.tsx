import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import {
  Bell,
  Clock,
  Plus,
  Trash2,
  Trophy,
  Flame,
  Star,
  TrendingUp,
  CheckCircle,
  Play,
  Timer,
  Settings,
  Award,
  Target,
} from 'lucide-react';
import {
  getReminders,
  saveReminders,
  addReminder,
  deleteReminder,
  updateReminder,
  getStreak,
  getBadges,
  getPoints,
  EYE_EXERCISES,
  recordExercise,
  requestNotificationPermission,
  type Reminder,
  type Badge,
  type Exercise,
} from '../services/reminderService';

export default function RemindersPage() {
  const { language, t } = useLanguage();
  const [reminders, setReminders] = useState(getReminders());
  const [streak, setStreak] = useState(getStreak());
  const [badges, setBadges] = useState(getBadges());
  const [points, setPoints] = useState(getPoints());
  const [activeTab, setActiveTab] = useState<'reminders' | 'exercises' | 'achievements'>('reminders');
  const [showAddReminder, setShowAddReminder] = useState(false);
  const [exerciseInProgress, setExerciseInProgress] = useState<string | null>(null);
  const [exerciseTimer, setExerciseTimer] = useState(0);
  const [notificationEnabled, setNotificationEnabled] = useState(Notification.permission === 'granted');

  // New Reminder Form
  const [newReminder, setNewReminder] = useState<Partial<Reminder>>({
    type: 'test',
    title: '',
    message: '',
    frequency: 'weekly',
    time: '09:00',
    enabled: true,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setStreak(getStreak());
      setBadges(getBadges());
      setPoints(getPoints());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Exercise Timer
  useEffect(() => {
    if (!exerciseInProgress) return;

    const exercise = EYE_EXERCISES.find((e) => e.id === exerciseInProgress);
    if (!exercise) return;

    setExerciseTimer(exercise.duration);

    const interval = setInterval(() => {
      setExerciseTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setExerciseInProgress(null);
          recordExercise(exercise.id);
          setStreak(getStreak());
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [exerciseInProgress]);

  const handleToggleReminder = (id: string, enabled: boolean) => {
    updateReminder(id, { enabled });
    setReminders(getReminders());
  };

  const handleDeleteReminder = (id: string) => {
    deleteReminder(id);
    setReminders(getReminders());
  };

  const handleAddReminder = () => {
    if (!newReminder.title || !newReminder.message) return;

    const reminder: Reminder = {
      id: `reminder-${Date.now()}`,
      type: newReminder.type as 'test' | 'exercise' | 'custom',
      title: newReminder.title,
      message: newReminder.message,
      frequency: newReminder.frequency as any,
      time: newReminder.time || '09:00',
      enabled: true,
    };

    addReminder(reminder);
    setReminders(getReminders());
    setShowAddReminder(false);
    setNewReminder({
      type: 'test',
      title: '',
      message: '',
      frequency: 'weekly',
      time: '09:00',
      enabled: true,
    });
  };

  const handleRequestNotification = async () => {
    const granted = await requestNotificationPermission();
    setNotificationEnabled(granted);
  };

  const startExercise = (exerciseId: string) => {
    setExerciseInProgress(exerciseId);
  };

  const unlockedBadges = badges.filter((b) => b.unlocked);
  const lockedBadges = badges.filter((b) => !b.unlocked);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2 flex items-center justify-center gap-3">
            <Bell className="w-10 h-10 text-purple-600" />
            {language === 'vi' ? 'Nhắc Nhở & Thành Tựu' : 'Reminders & Achievements'}
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            {language === 'vi'
              ? 'Luyện tập đều đặn, theo dõi tiến trình, mở khóa huy hiệu'
              : 'Practice regularly, track progress, unlock badges'}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-orange-400 to-red-500 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <Flame className="w-8 h-8" />
              <span className="text-3xl font-bold">{streak.currentStreak}</span>
            </div>
            <p className="text-sm opacity-90">{language === 'vi' ? 'Chuỗi hiện tại' : 'Current Streak'}</p>
            <p className="text-xs opacity-75 mt-1">
              {language === 'vi' ? 'Dài nhất:' : 'Longest:'} {streak.longestStreak}
            </p>
          </div>

          <div className="bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <Trophy className="w-8 h-8" />
              <span className="text-3xl font-bold">{points}</span>
            </div>
            <p className="text-sm opacity-90">{language === 'vi' ? 'Điểm số' : 'Points'}</p>
            <p className="text-xs opacity-75 mt-1">
              {language === 'vi' ? 'Huy hiệu:' : 'Badges:'} {unlockedBadges.length}/{badges.length}
            </p>
          </div>

          <div className="bg-gradient-to-br from-green-400 to-teal-500 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="w-8 h-8" />
              <span className="text-3xl font-bold">{streak.totalTests}</span>
            </div>
            <p className="text-sm opacity-90">{language === 'vi' ? 'Tổng test' : 'Total Tests'}</p>
            <p className="text-xs opacity-75 mt-1">{language === 'vi' ? 'Hoàn thành' : 'Completed'}</p>
          </div>

          <div className="bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <Target className="w-8 h-8" />
              <span className="text-3xl font-bold">{streak.totalExercises}</span>
            </div>
            <p className="text-sm opacity-90">{language === 'vi' ? 'Bài tập' : 'Exercises'}</p>
            <p className="text-xs opacity-75 mt-1">{language === 'vi' ? 'Đã làm' : 'Done'}</p>
          </div>
        </div>

        {/* Notification Permission */}
        {!notificationEnabled && (
          <div className="bg-yellow-100 dark:bg-yellow-900 border border-yellow-300 dark:border-yellow-700 rounded-xl p-4 mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="w-6 h-6 text-yellow-700 dark:text-yellow-300" />
              <div>
                <p className="font-semibold text-yellow-900 dark:text-yellow-100">
                  {language === 'vi' ? 'Bật thông báo' : 'Enable Notifications'}
                </p>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  {language === 'vi'
                    ? 'Cho phép thông báo để nhận nhắc nhở'
                    : 'Allow notifications to receive reminders'}
                </p>
              </div>
            </div>
            <button
              onClick={handleRequestNotification}
              className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
            >
              {language === 'vi' ? 'Bật ngay' : 'Enable'}
            </button>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          <button
            onClick={() => setActiveTab('reminders')}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors whitespace-nowrap ${
              activeTab === 'reminders'
                ? 'bg-purple-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <Bell className="w-5 h-5 inline mr-2" />
            {language === 'vi' ? 'Nhắc nhở' : 'Reminders'}
          </button>
          <button
            onClick={() => setActiveTab('exercises')}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors whitespace-nowrap ${
              activeTab === 'exercises'
                ? 'bg-purple-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <Play className="w-5 h-5 inline mr-2" />
            {language === 'vi' ? 'Bài tập mắt' : 'Eye Exercises'}
          </button>
          <button
            onClick={() => setActiveTab('achievements')}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors whitespace-nowrap ${
              activeTab === 'achievements'
                ? 'bg-purple-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <Trophy className="w-5 h-5 inline mr-2" />
            {language === 'vi' ? 'Thành tựu' : 'Achievements'}
          </button>
        </div>

        {/* REMINDERS TAB */}
        {activeTab === 'reminders' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                {language === 'vi' ? 'Nhắc nhở của bạn' : 'Your Reminders'}
              </h2>
              <button
                onClick={() => setShowAddReminder(true)}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-colors"
              >
                <Plus className="w-5 h-5" />
                {language === 'vi' ? 'Thêm' : 'Add'}
              </button>
            </div>

            {/* Add Reminder Form */}
            {showAddReminder && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
                  {language === 'vi' ? 'Tạo nhắc nhở mới' : 'Create New Reminder'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {language === 'vi' ? 'Loại' : 'Type'}
                    </label>
                    <select
                      value={newReminder.type}
                      onChange={(e) => setNewReminder({ ...newReminder, type: e.target.value as any })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="test">{language === 'vi' ? 'Kiểm tra' : 'Test'}</option>
                      <option value="exercise">{language === 'vi' ? 'Bài tập' : 'Exercise'}</option>
                      <option value="custom">{language === 'vi' ? 'Tùy chỉnh' : 'Custom'}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {language === 'vi' ? 'Tần suất' : 'Frequency'}
                    </label>
                    <select
                      value={newReminder.frequency}
                      onChange={(e) => setNewReminder({ ...newReminder, frequency: e.target.value as any })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="daily">{language === 'vi' ? 'Hàng ngày' : 'Daily'}</option>
                      <option value="weekly">{language === 'vi' ? 'Hàng tuần' : 'Weekly'}</option>
                      <option value="biweekly">{language === 'vi' ? '2 tuần/lần' : 'Biweekly'}</option>
                      <option value="monthly">{language === 'vi' ? 'Hàng tháng' : 'Monthly'}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {language === 'vi' ? 'Thời gian' : 'Time'}
                    </label>
                    <input
                      type="time"
                      value={newReminder.time}
                      onChange={(e) => setNewReminder({ ...newReminder, time: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {language === 'vi' ? 'Tiêu đề' : 'Title'}
                    </label>
                    <input
                      type="text"
                      value={newReminder.title}
                      onChange={(e) => setNewReminder({ ...newReminder, title: e.target.value })}
                      placeholder={language === 'vi' ? 'Nhập tiêu đề...' : 'Enter title...'}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {language === 'vi' ? 'Nội dung' : 'Message'}
                    </label>
                    <textarea
                      value={newReminder.message}
                      onChange={(e) => setNewReminder({ ...newReminder, message: e.target.value })}
                      placeholder={language === 'vi' ? 'Nhập nội dung...' : 'Enter message...'}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="flex gap-3 mt-4">
                  <button
                    onClick={handleAddReminder}
                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                  >
                    {language === 'vi' ? 'Tạo nhắc nhở' : 'Create Reminder'}
                  </button>
                  <button
                    onClick={() => setShowAddReminder(false)}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-800 dark:text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                  >
                    {language === 'vi' ? 'Hủy' : 'Cancel'}
                  </button>
                </div>
              </div>
            )}

            {/* Reminders List */}
            <div className="space-y-4">
              {reminders.map((reminder) => (
                <div
                  key={reminder.id}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 flex items-center justify-between"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className={`p-3 rounded-full ${reminder.enabled ? 'bg-purple-100 dark:bg-purple-900' : 'bg-gray-100 dark:bg-gray-700'}`}>
                      <Clock className={`w-6 h-6 ${reminder.enabled ? 'text-purple-600 dark:text-purple-300' : 'text-gray-400'}`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-800 dark:text-white">{reminder.title}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{reminder.message}</p>
                      <div className="flex gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                        <span className="capitalize">{reminder.frequency}</span>
                        <span>⏰ {reminder.time}</span>
                        <span className="capitalize px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700">
                          {reminder.type}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={reminder.enabled}
                        onChange={(e) => handleToggleReminder(reminder.id, e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
                    </label>
                    <button
                      onClick={() => handleDeleteReminder(reminder.id)}
                      className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* EXERCISES TAB */}
        {activeTab === 'exercises' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
              {language === 'vi' ? 'Bài tập mắt' : 'Eye Exercises'}
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              {language === 'vi'
                ? 'Làm bài tập đều đặn để giảm mỏi mắt và cải thiện thị lực'
                : 'Do exercises regularly to reduce eye strain and improve vision'}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {EYE_EXERCISES.map((exercise) => (
                <div
                  key={exercise.id}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-4xl">{exercise.icon}</span>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                        {language === 'vi' ? exercise.name : exercise.nameEn}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {exercise.duration < 60 ? `${exercise.duration}s` : `${Math.floor(exercise.duration / 60)}m`}
                      </p>
                    </div>
                  </div>

                  <p className="text-gray-700 dark:text-gray-300 mb-4">
                    {language === 'vi' ? exercise.description : exercise.descriptionEn}
                  </p>

                  {exerciseInProgress === exercise.id ? (
                    <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg p-4 text-white text-center">
                      <Timer className="w-8 h-8 mx-auto mb-2 animate-pulse" />
                      <p className="text-3xl font-bold">{exerciseTimer}s</p>
                      <p className="text-sm opacity-90">{language === 'vi' ? 'Đang tiến hành...' : 'In progress...'}</p>
                    </div>
                  ) : (
                    <button
                      onClick={() => startExercise(exercise.id)}
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
                    >
                      <Play className="w-5 h-5" />
                      {language === 'vi' ? 'Bắt đầu' : 'Start'}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ACHIEVEMENTS TAB */}
        {activeTab === 'achievements' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
              {language === 'vi' ? 'Huy hiệu & Thành tựu' : 'Badges & Achievements'}
            </h2>

            {/* Unlocked Badges */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                <Trophy className="w-6 h-6 text-yellow-500" />
                {language === 'vi' ? 'Đã mở khóa' : 'Unlocked'} ({unlockedBadges.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {unlockedBadges.map((badge) => (
                  <div
                    key={badge.id}
                    className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl shadow-lg p-6 text-white"
                  >
                    <div className="text-center">
                      <span className="text-5xl mb-3 block">{badge.icon}</span>
                      <h4 className="text-lg font-bold mb-1">
                        {language === 'vi' ? badge.name : badge.nameEn}
                      </h4>
                      <p className="text-sm opacity-90">
                        {language === 'vi' ? badge.description : badge.descriptionEn}
                      </p>
                      {badge.unlockedAt && (
                        <p className="text-xs opacity-75 mt-2">
                          {new Date(badge.unlockedAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Locked Badges */}
            <div>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                <Award className="w-6 h-6 text-gray-400" />
                {language === 'vi' ? 'Chưa mở khóa' : 'Locked'} ({lockedBadges.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {lockedBadges.map((badge) => (
                  <div
                    key={badge.id}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-2 border-dashed border-gray-300 dark:border-gray-600"
                  >
                    <div className="text-center opacity-60">
                      <span className="text-5xl mb-3 block grayscale">{badge.icon}</span>
                      <h4 className="text-lg font-bold text-gray-800 dark:text-white mb-1">
                        {language === 'vi' ? badge.name : badge.nameEn}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {language === 'vi' ? badge.description : badge.descriptionEn}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
