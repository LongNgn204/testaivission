/**
 * =================================================================
 * 🗓️ RoutineContext - Lịch trình cá nhân hóa & trạng thái thiết lập
 * =================================================================
 *
 * MỤC ĐÍCH:
 * - Lưu/lấy lịch trình hàng tuần do AI tạo (WeeklyRoutine) theo từng user.
 * - Lưu câu trả lời setup ban đầu (AnswerState) để tái sử dụng cho AI/Coach.
 * - Theo dõi trạng thái: đã setup xong? đã xem welcome? hoạt động hôm nay hoàn thành?
 * - Persist toàn bộ vào localStorage với KEY gắn theo user (từ user_data.phone).
 *
 * CÁCH SỬ DỤNG:
 * - Bọc <RoutineProvider> quanh App.
 * - Dùng hook: const { weeklyRoutine, saveRoutine, completedActivities, toggleActivityCompletion } = useRoutine();
 * - Gọi saveRoutine(routine, answers) sau khi trang PersonalizedSetupPage tạo xong routine.
 * - Với danh sách hoạt động hôm nay, xác định identifier theo `${key}-${index}` để toggle.
 */
import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
import { WeeklyRoutine, AnswerState } from '../types';

interface RoutineContextType {
  weeklyRoutine: WeeklyRoutine | null;        // Lịch trình theo ngày trong tuần
  userProfile: AnswerState | null;           // Hồ sơ trả lời cá nhân hoá
  isSetupComplete: boolean;                  // Đã hoàn thành bước setup chưa
  isWelcomeSeen: boolean;                    // Đã xem trang Welcome chưa
  completedActivities: Record<string, boolean>; // Map `${key}-${index}` → true/false cho hôm nay
  saveRoutine: (routine: WeeklyRoutine, answers: AnswerState) => void; // Lưu routine + đánh dấu setup complete
  markWelcomeAsSeen: () => void;             // Đánh dấu đã xem Welcome
  markActivityAsCompleted: (activityKey: string) => void; // Đánh dấu hoạt động đầu tiên theo key là completed (an toàn)
  toggleActivityCompletion: (activityIdentifier: string) => void;      // Toggle completed cho identifier cụ thể
}

const RoutineContext = createContext<RoutineContextType | undefined>(undefined);

// Prefix key theo user để tránh lẫn dữ liệu khi nhiều người dùng đăng nhập cùng thiết bị
const ROUTINE_KEY_PREFIX = 'aiVisionRoutine_';
const SETUP_COMPLETE_KEY_PREFIX = 'aiVisionSetupComplete_';
const WELCOME_SEEN_KEY_PREFIX = 'aiVisionWelcomeSeen_';
const SETUP_ANSWERS_KEY_PREFIX = 'aiVisionSetupAnswers_';

// Lấy userId từ localStorage.user_data (phone) để phân vùng dữ liệu theo người dùng hiện tại
const getUserId = (): string => {
  try {
    const userData = localStorage.getItem('user_data');
    if (userData) {
      const user = JSON.parse(userData);
      return user.phone || 'default';
    }
  } catch (error) {
    console.error('Failed to get user ID:', error);
  }
  return 'default';
};

// Key lưu trạng thái hoàn thành hoạt động theo NGÀY (reset mỗi ngày)
const getTodayStorageKey = () => `completed_activities_${getUserId()}_${new Date().toISOString().split('T')[0]}`;

export const RoutineProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [weeklyRoutine, setWeeklyRoutine] = useState<WeeklyRoutine | null>(null);
  const [userProfile, setUserProfile] = useState<AnswerState | null>(null);
  const [isSetupComplete, setIsSetupComplete] = useState<boolean>(false);
  const [isWelcomeSeen, setIsWelcomeSeen] = useState<boolean>(false);
  const [completedActivities, setCompletedActivities] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);

  // Khởi tạo từ localStorage khi load app
  useEffect(() => {
    try {
      const userId = getUserId();
      const storedRoutine = localStorage.getItem(`${ROUTINE_KEY_PREFIX}${userId}`);
      if (storedRoutine) setWeeklyRoutine(JSON.parse(storedRoutine));

      const setupComplete = localStorage.getItem(`${SETUP_COMPLETE_KEY_PREFIX}${userId}`) === 'true';
      setIsSetupComplete(setupComplete);

      const welcomeSeen = localStorage.getItem(`${WELCOME_SEEN_KEY_PREFIX}${userId}`) === 'true';
      setIsWelcomeSeen(welcomeSeen);

      const storedProfile = localStorage.getItem(`${SETUP_ANSWERS_KEY_PREFIX}${userId}`);
      if (storedProfile) setUserProfile(JSON.parse(storedProfile));

      const storedCompletions = localStorage.getItem(getTodayStorageKey());
      if (storedCompletions) setCompletedActivities(JSON.parse(storedCompletions));
    } catch (error) {
      console.error('Failed to load routine from storage', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Lưu routine + answers cho user hiện tại
  const saveRoutine = (routine: WeeklyRoutine, answers: AnswerState) => {
    const userId = getUserId();
    localStorage.setItem(`${ROUTINE_KEY_PREFIX}${userId}`, JSON.stringify(routine));
    localStorage.setItem(`${SETUP_COMPLETE_KEY_PREFIX}${userId}`, 'true');
    localStorage.setItem(`${SETUP_ANSWERS_KEY_PREFIX}${userId}`, JSON.stringify(answers));
    setWeeklyRoutine(routine);
    setIsSetupComplete(true);
    setUserProfile(answers);
  };

  // Đánh dấu đã xem Welcome để không hiển thị lại
  const markWelcomeAsSeen = () => {
    const userId = getUserId();
    localStorage.setItem(`${WELCOME_SEEN_KEY_PREFIX}${userId}`, 'true');
    setIsWelcomeSeen(true);
  };

  // Lấy danh sách hoạt động hôm nay theo thứ trong tuần
  const getTodaysActivities = useCallback(() => {
    if (!weeklyRoutine) return [] as NonNullable<WeeklyRoutine[keyof WeeklyRoutine]>;
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const;
    const today = daysOfWeek[new Date().getDay()];
    return weeklyRoutine[today] || [];
  }, [weeklyRoutine]);

  // Đánh dấu hoạt động đầu tiên có key trùng mà chưa completed (an toàn khi có nhiều mục giống nhau)
  const markActivityAsCompleted = useCallback((activityKey: string) => {
    setCompletedActivities(prev => {
      const todaysActivities = getTodaysActivities();
      const activityIndex = todaysActivities.findIndex((act, index) => {
        const identifier = `${act.key}-${index}`;
        return act.key === activityKey && !prev[identifier];
      });

      if (activityIndex !== -1) {
        const activity = todaysActivities[activityIndex];
        const identifierToUpdate = `${activity.key}-${activityIndex}`;
        const newCompleted = { ...prev, [identifierToUpdate]: true };
        localStorage.setItem(getTodayStorageKey(), JSON.stringify(newCompleted));
        return newCompleted;
      }
      return prev;
    });
  }, [getTodaysActivities]);

  // Toggle completed cho một item cụ thể theo identifier `${key}-${index}`
  const toggleActivityCompletion = useCallback((activityIdentifier: string) => {
    setCompletedActivities(prev => {
      const newCompleted = { ...prev, [activityIdentifier]: !prev[activityIdentifier] };
      localStorage.setItem(getTodayStorageKey(), JSON.stringify(newCompleted));
      return newCompleted;
    });
  }, []);

  if (isLoading) {
    return null; // Có thể trả về spinner nếu muốn
  }

  return (
    <RoutineContext.Provider
      value={{
        weeklyRoutine,
        userProfile,
        isSetupComplete,
        isWelcomeSeen,
        completedActivities,
        saveRoutine,
        markWelcomeAsSeen,
        markActivityAsCompleted,
        toggleActivityCompletion,
      }}
    >
      {children}
    </RoutineContext.Provider>
  );
};

export const useRoutine = (): RoutineContextType => {
  const context = useContext(RoutineContext);
  if (!context) {
    throw new Error('useRoutine must be used within a RoutineProvider');
  }
  return context;
};
