<<<<<<< HEAD
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { AnswerState } from '../types';

interface User extends AnswerState {
    name: string;
}

interface UserContextType {
    user: User | null;
    isLoggedIn: boolean;
    login: (userData: User) => void;
    logout: () => void;
    isLoading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        try {
            const storedUserData = localStorage.getItem('user_data');
            if (storedUserData) {
                setUser(JSON.parse(storedUserData));
            }
        } catch (error) {
            console.error("Failed to parse user data from localStorage", error);
            localStorage.removeItem('user_data');
        }
        setIsLoading(false);
    }, []);

    const login = (userData: User) => {
        setUser(userData);
        localStorage.setItem('user_data', JSON.stringify(userData));
        window.dispatchEvent(new Event('userLoggedIn'));
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user_data');
        localStorage.removeItem('personalized_routine'); // Also clear routine
        localStorage.removeItem('test_history'); // And test history
        window.dispatchEvent(new Event('userLoggedOut'));
    };

    return (
        <UserContext.Provider value={{ user, isLoggedIn: !!user, login, logout, isLoading }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};

=======
/**
 * ============================================================
 * 👤 User Context - User Data & Test History Management
 * ============================================================
 * 
 * MỤC ĐÍCH:
 * - Quản lý thông tin người dùng (name, email, phone, age)
 * - Quản lý lịch sử bài test
 * - Quản lý token xác thực
 * - Đồng bộ dữ liệu với backend
 * 
 * FEATURES:
 * - Lưu/lấy thông tin user
 * - Lưu/lấy lịch sử test
 * - Xóa test result
 * - Đồng bộ với localStorage
 * - Đồng bộ với backend API
 */

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { getAuthToken, saveTestResult, getTestHistory } from '../services/authService';

// ============================================================
// TYPES
// ============================================================

export interface UserData {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  age?: string;
  loginTime?: number;
  loginCount?: number;
}

export interface TestResult {
  id: string;
  testType: string;
  testData: any;
  score?: number;
  result?: string;
  timestamp: number;
}

export interface UserContextType {
  // User Data
  user: UserData | null;
  setUser: (user: UserData | null) => void;
  
  // Test History
  testHistory: TestResult[];
  loadTestHistory: () => Promise<void>;
  addTestResult: (testData: Omit<TestResult, 'id' | 'timestamp'>) => Promise<TestResult | null>;
  removeTestResult: (testId: string) => void;
  clearTestHistory: () => void;
  
  // Utilities
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
}

// ============================================================
// CONTEXT
// ============================================================

const UserContext = createContext<UserContextType | undefined>(undefined);

// ============================================================
// PROVIDER
// ============================================================

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // State
  const [user, setUser] = useState<UserData | null>(null);
  const [testHistory, setTestHistory] = useState<TestResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ============================================================
  // INITIALIZATION
  // ============================================================

  // Load user data from localStorage on mount
  useEffect(() => {
    const loadUserData = () => {
      try {
        const userData = localStorage.getItem('user_data');
        if (userData) {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
          
          // Load test history from backend if user is authenticated
          if (parsedUser.id) {
            loadTestHistoryFromBackend(parsedUser.id);
          }
        }
      } catch (error) {
        console.error('Failed to load user data:', error);
      }
    };

    loadUserData();

    // Listen for storage changes (multi-tab sync)
    window.addEventListener('storage', loadUserData);
    return () => window.removeEventListener('storage', loadUserData);
  }, []);

  // ============================================================
  // USER MANAGEMENT
  // ============================================================

  const handleSetUser = useCallback((newUser: UserData | null) => {
    setUser(newUser);
    
    if (newUser) {
      try {
        localStorage.setItem('user_data', JSON.stringify(newUser));
      } catch (error) {
        console.error('Failed to save user data:', error);
      }
    } else {
      try {
        localStorage.removeItem('user_data');
        setTestHistory([]);
      } catch (error) {
        console.error('Failed to clear user data:', error);
      }
    }
  }, []);

  // ============================================================
  // TEST HISTORY MANAGEMENT
  // ============================================================

  /**
   * Load test history from backend
   */
  const loadTestHistoryFromBackend = useCallback(async (userId: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await getTestHistory(userId, 100, 0);

      if (response.success) {
        setTestHistory(response.history);
        
        // Also save to localStorage for offline access
        try {
          localStorage.setItem(`test_history_${userId}`, JSON.stringify(response.history));
        } catch (error) {
          console.warn('Failed to save test history to localStorage:', error);
        }
      } else {
        // Try to load from localStorage as fallback
        const cached = localStorage.getItem(`test_history_${userId}`);
        if (cached) {
          setTestHistory(JSON.parse(cached));
        }
      }
    } catch (error) {
      console.error('Failed to load test history:', error);
      setError('Failed to load test history');
      
      // Try to load from localStorage as fallback
      if (user?.id) {
        const cached = localStorage.getItem(`test_history_${user.id}`);
        if (cached) {
          setTestHistory(JSON.parse(cached));
        }
      }
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  /**
   * Load test history (public method)
   */
  const loadTestHistory = useCallback(async () => {
    if (user?.id) {
      await loadTestHistoryFromBackend(user.id);
    }
  }, [user?.id, loadTestHistoryFromBackend]);

  /**
   * Add test result
   */
  const addTestResult = useCallback(async (testData: Omit<TestResult, 'id' | 'timestamp'>) => {
    try {
      setIsLoading(true);
      setError(null);

      // Save to backend
      const response = await saveTestResult({
        testType: testData.testType,
        testData: testData.testData,
        score: testData.score,
        result: testData.result,
      });

      if (response.success && response.testResult) {
        const newResult: TestResult = {
          id: response.testResult.id,
          testType: response.testResult.testType,
          testData: response.testResult.testData,
          score: response.testResult.score,
          result: response.testResult.result,
          timestamp: response.testResult.timestamp,
        };

        // Use functional update to avoid stale closure
        setTestHistory(prev => {
          const updated = [newResult, ...prev];
          
          // Save to localStorage inside functional update
          if (user?.id) {
            try {
              localStorage.setItem(`test_history_${user.id}`, JSON.stringify(updated));
            } catch (error) {
              console.warn('Failed to save test history to localStorage:', error);
            }
          }
          
          return updated;
        });

        return newResult;
      } else {
        setError(response.error || 'Failed to save test result');
        return null;
      }
    } catch (error: any) {
      console.error('Failed to add test result:', error);
      setError(error.message || 'Failed to save test result');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  /**
   * Remove test result
   */
  const removeTestResult = useCallback((testId: string) => {
    setTestHistory(prev => prev.filter(test => test.id !== testId));

    // Update localStorage
    if (user?.id) {
      try {
        const updated = testHistory.filter(test => test.id !== testId);
        localStorage.setItem(`test_history_${user.id}`, JSON.stringify(updated));
      } catch (error) {
        console.warn('Failed to update localStorage:', error);
      }
    }
  }, [user?.id, testHistory]);

  /**
   * Clear all test history
   */
  const clearTestHistory = useCallback(() => {
    setTestHistory([]);

    // Clear localStorage
    if (user?.id) {
      try {
        localStorage.removeItem(`test_history_${user.id}`);
      } catch (error) {
        console.warn('Failed to clear localStorage:', error);
      }
    }
  }, [user?.id]);

  /**
   * Clear error message
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // ============================================================
  // CONTEXT VALUE
  // ============================================================

  const value: UserContextType = {
    user,
    setUser: handleSetUser,
    testHistory,
    loadTestHistory,
    addTestResult,
    removeTestResult,
    clearTestHistory,
    isLoading,
    error,
    clearError,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

// ============================================================
// HOOK
// ============================================================

/**
 * Hook to use UserContext
 */
export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within UserProvider');
  }
  return context;
};

export default UserContext;

>>>>>>> cab493fd386716360f3fd4f7e7a23ccc7972d8e7
