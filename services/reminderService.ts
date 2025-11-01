// 🔔 REMINDER SERVICE - Smart Notifications & Routines
// Manages test reminders, eye exercises, streaks, and gamification

export interface Reminder {
  id: string;
  type: 'test' | 'exercise' | 'custom';
  title: string;
  message: string;
  frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly';
  time: string; // HH:MM format
  enabled: boolean;
  lastTriggered?: number; // timestamp
  testType?: string; // for test reminders
}

export interface Exercise {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  descriptionEn: string;
  duration: number; // seconds
  icon: string;
}

export interface Streak {
  currentStreak: number;
  longestStreak: number;
  lastActivity: number; // timestamp
  totalTests: number;
  totalExercises: number;
}

export interface Badge {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  descriptionEn: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: number;
  requirement: string;
}

const REMINDER_KEY = 'vision_reminders';
const STREAK_KEY = 'vision_streak';
const BADGES_KEY = 'vision_badges';
const EXERCISES_DONE_KEY = 'exercises_done';

// 🏃 PREDEFINED EYE EXERCISES
export const EYE_EXERCISES: Exercise[] = [
  {
    id: '20-20-20',
    name: '20-20-20 Rule',
    nameEn: '20-20-20 Rule',
    description: 'Cứ 20 phút, nhìn vật cách 20 feet (6m) trong 20 giây',
    descriptionEn: 'Every 20 minutes, look at something 20 feet away for 20 seconds',
    duration: 20,
    icon: '👁️',
  },
  {
    id: 'palming',
    name: 'Xoa bàn tay làm ấm mắt',
    nameEn: 'Eye Palming',
    description: 'Xoa tay cho ấm, đặt nhẹ lên mắt 1-2 phút để thư giãn',
    descriptionEn: 'Rub hands together, place gently over eyes for 1-2 minutes',
    duration: 120,
    icon: '🤲',
  },
  {
    id: 'figure-8',
    name: 'Vẽ số 8 nằm ngang',
    nameEn: 'Figure 8 Tracking',
    description: 'Tưởng tượng số 8 nằm ngang 3m trước mắt, lần theo đường viền',
    descriptionEn: 'Imagine a large figure 8 on the floor, trace it with your eyes',
    duration: 60,
    icon: '∞',
  },
  {
    id: 'near-far',
    name: 'Luyện tập Gần-Xa',
    nameEn: 'Near-Far Focus',
    description: 'Giữ ngón tay cách mắt 10cm, nhìn 5s. Sau đó nhìn xa 5s. Lặp lại',
    descriptionEn: 'Hold finger 10cm away, focus 5s. Then focus far away 5s. Repeat',
    duration: 60,
    icon: '👆',
  },
  {
    id: 'blinking',
    name: 'Chớp mắt nhanh',
    nameEn: 'Rapid Blinking',
    description: 'Chớp mắt nhanh 10 lần, nghỉ. Lặp lại 5 lần',
    descriptionEn: 'Blink rapidly 10 times, rest. Repeat 5 times',
    duration: 30,
    icon: '😉',
  },
];

// 🏆 BADGES SYSTEM
export const BADGES: Badge[] = [
  {
    id: 'first-test',
    name: 'Người Mới Bắt Đầu',
    nameEn: 'Beginner',
    description: 'Hoàn thành bài test đầu tiên',
    descriptionEn: 'Complete your first test',
    icon: '🎯',
    unlocked: false,
    requirement: 'tests_1',
  },
  {
    id: 'test-master',
    name: 'Chuyên Gia Test',
    nameEn: 'Test Master',
    description: 'Hoàn thành 10 bài test',
    descriptionEn: 'Complete 10 tests',
    icon: '🏅',
    unlocked: false,
    requirement: 'tests_10',
  },
  {
    id: 'streak-7',
    name: 'Kiên Trì 7 Ngày',
    nameEn: '7-Day Streak',
    description: 'Test liên tiếp 7 ngày',
    descriptionEn: 'Test for 7 days in a row',
    icon: '🔥',
    unlocked: false,
    requirement: 'streak_7',
  },
  {
    id: 'streak-30',
    name: 'Chiến Binh 30 Ngày',
    nameEn: '30-Day Warrior',
    description: 'Test liên tiếp 30 ngày',
    descriptionEn: 'Test for 30 days in a row',
    icon: '⚡',
    unlocked: false,
    requirement: 'streak_30',
  },
  {
    id: 'exercise-10',
    name: 'Người Tập Luyện',
    nameEn: 'Fitness Enthusiast',
    description: 'Hoàn thành 10 bài tập mắt',
    descriptionEn: 'Complete 10 eye exercises',
    icon: '💪',
    unlocked: false,
    requirement: 'exercises_10',
  },
  {
    id: 'perfect-vision',
    name: 'Thị Lực Hoàn Hảo',
    nameEn: 'Perfect Vision',
    description: 'Đạt 20/20 trong test Snellen',
    descriptionEn: 'Achieve 20/20 in Snellen test',
    icon: '👁️‍🗨️',
    unlocked: false,
    requirement: 'snellen_perfect',
  },
  {
    id: 'all-tests',
    name: 'Nhà Khám Phá',
    nameEn: 'Explorer',
    description: 'Thử tất cả 5 loại test',
    descriptionEn: 'Try all 5 test types',
    icon: '🧭',
    unlocked: false,
    requirement: 'all_test_types',
  },
];

// 🔔 REQUEST NOTIFICATION PERMISSION
export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!('Notification' in window)) {
    console.log('Browser không hỗ trợ notifications');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
};

// 📢 SHOW NOTIFICATION
export const showNotification = (title: string, body: string, icon?: string) => {
  if (Notification.permission === 'granted') {
    new Notification(title, {
      body,
      icon: icon || '/eye-icon.png',
      badge: '/eye-icon.png',
      tag: 'vision-reminder',
      requireInteraction: false,
    });
  }
};

// 💾 GET REMINDERS
export const getReminders = (): Reminder[] => {
  const data = localStorage.getItem(REMINDER_KEY);
  return data ? JSON.parse(data) : getDefaultReminders();
};

// 📝 GET DEFAULT REMINDERS
const getDefaultReminders = (): Reminder[] => [
  {
    id: 'weekly-test',
    type: 'test',
    title: 'Nhắc nhở test thị lực',
    message: 'Đã đến lúc kiểm tra thị lực hàng tuần! 👁️',
    frequency: 'weekly',
    time: '09:00',
    enabled: true,
  },
  {
    id: '20-20-20-reminder',
    type: 'exercise',
    title: 'Nghỉ mắt 20-20-20',
    message: 'Hãy nhìn xa 20 giây để mắt thư giãn! 🌿',
    frequency: 'daily',
    time: '10:00',
    enabled: true,
  },
];

// 💾 SAVE REMINDERS
export const saveReminders = (reminders: Reminder[]) => {
  localStorage.setItem(REMINDER_KEY, JSON.stringify(reminders));
};

// ➕ ADD REMINDER
export const addReminder = (reminder: Reminder) => {
  const reminders = getReminders();
  reminders.push(reminder);
  saveReminders(reminders);
};

// 🗑️ DELETE REMINDER
export const deleteReminder = (id: string) => {
  const reminders = getReminders().filter((r) => r.id !== id);
  saveReminders(reminders);
};

// ✏️ UPDATE REMINDER
export const updateReminder = (id: string, updates: Partial<Reminder>) => {
  const reminders = getReminders().map((r) => (r.id === id ? { ...r, ...updates } : r));
  saveReminders(reminders);
};

// 🔥 GET STREAK DATA
export const getStreak = (): Streak => {
  const data = localStorage.getItem(STREAK_KEY);
  return data
    ? JSON.parse(data)
    : { currentStreak: 0, longestStreak: 0, lastActivity: 0, totalTests: 0, totalExercises: 0 };
};

// 💾 SAVE STREAK
export const saveStreak = (streak: Streak) => {
  localStorage.setItem(STREAK_KEY, JSON.stringify(streak));
};

// ⚡ UPDATE STREAK (call after test/exercise)
export const updateStreak = (type: 'test' | 'exercise') => {
  const streak = getStreak();
  const now = Date.now();
  const lastActivityDate = new Date(streak.lastActivity).toDateString();
  const todayDate = new Date(now).toDateString();
  const yesterdayDate = new Date(now - 86400000).toDateString();

  // Update counts
  if (type === 'test') {
    streak.totalTests++;
  } else {
    streak.totalExercises++;
  }

  // Update streak
  if (lastActivityDate === todayDate) {
    // Same day, no change to streak
  } else if (lastActivityDate === yesterdayDate) {
    // Consecutive day
    streak.currentStreak++;
    if (streak.currentStreak > streak.longestStreak) {
      streak.longestStreak = streak.currentStreak;
    }
  } else {
    // Streak broken
    streak.currentStreak = 1;
  }

  streak.lastActivity = now;
  saveStreak(streak);
  checkBadges(); // Check if any badges unlocked
};

// 🏆 GET BADGES
export const getBadges = (): Badge[] => {
  const data = localStorage.getItem(BADGES_KEY);
  return data ? JSON.parse(data) : BADGES;
};

// 💾 SAVE BADGES
export const saveBadges = (badges: Badge[]) => {
  localStorage.setItem(BADGES_KEY, JSON.stringify(badges));
};

// ✅ CHECK AND UNLOCK BADGES
export const checkBadges = () => {
  const badges = getBadges();
  const streak = getStreak();
  const history = JSON.parse(localStorage.getItem('test_history') || '[]');
  
  // Count unique test types
  const testTypes = new Set(history.map((h: any) => h.testType));

  let newUnlocks = 0;

  badges.forEach((badge) => {
    if (badge.unlocked) return;

    let shouldUnlock = false;

    switch (badge.requirement) {
      case 'tests_1':
        shouldUnlock = streak.totalTests >= 1;
        break;
      case 'tests_10':
        shouldUnlock = streak.totalTests >= 10;
        break;
      case 'streak_7':
        shouldUnlock = streak.currentStreak >= 7;
        break;
      case 'streak_30':
        shouldUnlock = streak.currentStreak >= 30;
        break;
      case 'exercises_10':
        shouldUnlock = streak.totalExercises >= 10;
        break;
      case 'snellen_perfect':
        shouldUnlock = history.some((h: any) => h.testType === 'snellen' && h.score === '20/20');
        break;
      case 'all_test_types':
        shouldUnlock = testTypes.size >= 5;
        break;
    }

    if (shouldUnlock) {
      badge.unlocked = true;
      badge.unlockedAt = Date.now();
      newUnlocks++;
      
      // Show notification for new badge
      showNotification(
        '🏆 Badge mới!',
        `Bạn đã mở khóa: ${badge.name}`,
        badge.icon
      );
    }
  });

  if (newUnlocks > 0) {
    saveBadges(badges);
  }

  return newUnlocks;
};

// 📊 GET POINTS
export const getPoints = (): number => {
  const streak = getStreak();
  const badges = getBadges().filter((b) => b.unlocked);
  
  return (
    streak.totalTests * 10 +
    streak.totalExercises * 5 +
    streak.currentStreak * 20 +
    badges.length * 100
  );
};

// 🎯 RECORD EXERCISE COMPLETION
export const recordExercise = (exerciseId: string) => {
  const done = JSON.parse(localStorage.getItem(EXERCISES_DONE_KEY) || '[]');
  done.push({
    exerciseId,
    timestamp: Date.now(),
  });
  localStorage.setItem(EXERCISES_DONE_KEY, JSON.stringify(done));
  
  updateStreak('exercise');
  
  showNotification(
    '✅ Bài tập hoàn thành!',
    'Tuyệt vời! Mắt của bạn cảm ơn bạn! 😊'
  );
};

// ⏰ CHECK IF REMINDER SHOULD TRIGGER
export const checkReminders = () => {
  const reminders = getReminders();
  const now = new Date();
  const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  const currentDay = now.getDay();

  reminders.forEach((reminder) => {
    if (!reminder.enabled) return;
    if (reminder.time !== currentTime) return;

    const lastTriggered = reminder.lastTriggered || 0;
    const hoursSinceLastTrigger = (Date.now() - lastTriggered) / 1000 / 60 / 60;

    let shouldTrigger = false;

    switch (reminder.frequency) {
      case 'daily':
        shouldTrigger = hoursSinceLastTrigger >= 24;
        break;
      case 'weekly':
        shouldTrigger = hoursSinceLastTrigger >= 168; // 7 days
        break;
      case 'biweekly':
        shouldTrigger = hoursSinceLastTrigger >= 336; // 14 days
        break;
      case 'monthly':
        shouldTrigger = hoursSinceLastTrigger >= 720; // 30 days
        break;
    }

    if (shouldTrigger) {
      showNotification(reminder.title, reminder.message);
      updateReminder(reminder.id, { lastTriggered: Date.now() });
    }
  });
};

// 🚀 INITIALIZE REMINDER SYSTEM
let reminderInterval: NodeJS.Timeout | null = null; // ✅ FIX: Track interval to prevent multiple instances

export const initializeReminderSystem = () => {
  // Prevent multiple initializations
  if (reminderInterval) {
    return;
  }

  // Request permission on first load
  requestNotificationPermission();

  // Check badges on load
  checkBadges();

  // Check reminders every minute
  reminderInterval = setInterval(checkReminders, 60000);
};

// 🛑 CLEANUP REMINDER SYSTEM (for testing/cleanup)
export const cleanupReminderSystem = () => {
  if (reminderInterval) {
    clearInterval(reminderInterval);
    reminderInterval = null;
  }
};
