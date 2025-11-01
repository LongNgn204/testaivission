import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
import { WeeklyRoutine, AnswerState, RoutineActivity } from '../types';

interface RoutineContextType {
  weeklyRoutine: WeeklyRoutine | null;
  userProfile: AnswerState | null;
  isSetupComplete: boolean;
  isWelcomeSeen: boolean;
  completedActivities: Record<string, boolean>;
  saveRoutine: (routine: WeeklyRoutine, answers: AnswerState) => void;
  markWelcomeAsSeen: () => void;
  markActivityAsCompleted: (activityKey: string) => void;
  toggleActivityCompletion: (activityIdentifier: string) => void;
}

const RoutineContext = createContext<RoutineContextType | undefined>(undefined);

const ROUTINE_KEY_PREFIX = 'aiVisionRoutine_';
const SETUP_COMPLETE_KEY_PREFIX = 'aiVisionSetupComplete_';
const WELCOME_SEEN_KEY_PREFIX = 'aiVisionWelcomeSeen_';
const SETUP_ANSWERS_KEY_PREFIX = 'aiVisionSetupAnswers_';

// Get current user ID
const getUserId = (): string => {
  try {
    const userData = localStorage.getItem('user_data');
    if (userData) {
      const user = JSON.parse(userData);
      return user.phone || 'default';
    }
  } catch (error) {
    console.error("Failed to get user ID:", error);
  }
  return 'default';
};

const getTodayStorageKey = () => `completed_activities_${getUserId()}_${new Date().toISOString().split('T')[0]}`;


export const RoutineProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [weeklyRoutine, setWeeklyRoutine] = useState<WeeklyRoutine | null>(null);
  const [userProfile, setUserProfile] = useState<AnswerState | null>(null);
  const [isSetupComplete, setIsSetupComplete] = useState<boolean>(false);
  const [isWelcomeSeen, setIsWelcomeSeen] = useState<boolean>(false);
  const [completedActivities, setCompletedActivities] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const userId = getUserId();
      const storedRoutine = localStorage.getItem(`${ROUTINE_KEY_PREFIX}${userId}`);
      if (storedRoutine) {
        setWeeklyRoutine(JSON.parse(storedRoutine));
      }
      const setupComplete = localStorage.getItem(`${SETUP_COMPLETE_KEY_PREFIX}${userId}`) === 'true';
      setIsSetupComplete(setupComplete);

      const welcomeSeen = localStorage.getItem(`${WELCOME_SEEN_KEY_PREFIX}${userId}`) === 'true';
      setIsWelcomeSeen(welcomeSeen);

      const storedProfile = localStorage.getItem(`${SETUP_ANSWERS_KEY_PREFIX}${userId}`);
      if (storedProfile) {
        setUserProfile(JSON.parse(storedProfile));
      }

      const storedCompletions = localStorage.getItem(getTodayStorageKey());
      if (storedCompletions) {
        setCompletedActivities(JSON.parse(storedCompletions));
      }
      
    } catch (error) {
        console.error("Failed to load routine from storage", error);
    } finally {
        setIsLoading(false);
    }
  }, []);

  const saveRoutine = (routine: WeeklyRoutine, answers: AnswerState) => {
    const userId = getUserId();
    localStorage.setItem(`${ROUTINE_KEY_PREFIX}${userId}`, JSON.stringify(routine));
    localStorage.setItem(`${SETUP_COMPLETE_KEY_PREFIX}${userId}`, 'true');
    localStorage.setItem(`${SETUP_ANSWERS_KEY_PREFIX}${userId}`, JSON.stringify(answers));
    setWeeklyRoutine(routine);
    setIsSetupComplete(true);
    setUserProfile(answers);
  };
  
  const markWelcomeAsSeen = () => {
    const userId = getUserId();
    localStorage.setItem(`${WELCOME_SEEN_KEY_PREFIX}${userId}`, 'true');
    setIsWelcomeSeen(true);
  };

  const getTodaysActivities = useCallback(() => {
    if (!weeklyRoutine) return [];
    const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const today = daysOfWeek[new Date().getDay()];
    return weeklyRoutine[today] || [];
  }, [weeklyRoutine]);

  const markActivityAsCompleted = useCallback((activityKey: string) => {
    setCompletedActivities(prev => {
        const todaysActivities = getTodaysActivities();
        // Find the first non-completed activity that matches the key
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
        return prev; // No change if no matching activity is found
    });
  }, [getTodaysActivities]);

  const toggleActivityCompletion = useCallback((activityIdentifier: string) => {
      setCompletedActivities(prev => {
          const newCompleted = {
              ...prev,
              [activityIdentifier]: !prev[activityIdentifier]
          };
          localStorage.setItem(getTodayStorageKey(), JSON.stringify(newCompleted));
          return newCompleted;
      });
  }, []);


  if (isLoading) {
    return null; // Or render a loading spinner
  }

  return (
    <RoutineContext.Provider value={{ weeklyRoutine, userProfile, isSetupComplete, isWelcomeSeen, completedActivities, saveRoutine, markWelcomeAsSeen, markActivityAsCompleted, toggleActivityCompletion }}>
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