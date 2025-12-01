import React, { createContext, useContext, useState, useCallback } from 'react';
import { ToastContainer, ToastMessage, ToastType } from '../components/Toast';

interface ToastContextType {
  addToast: (
    message: string,
    type?: ToastType,
    duration?: number,
    action?: ToastMessage['action']
  ) => string;
  removeToast: (id: string) => void;
  success: (message: string, duration?: number, action?: ToastMessage['action']) => string;
  error: (message: string, duration?: number, action?: ToastMessage['action']) => string;
  warning: (message: string, duration?: number, action?: ToastMessage['action']) => string;
  info: (message: string, duration?: number, action?: ToastMessage['action']) => string;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

/**
 * Toast Provider Component
 */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback(
    (
      message: string,
      type: ToastType = 'info',
      duration: number = 5000,
      action?: ToastMessage['action']
    ): string => {
      const id = `${Date.now()}-${Math.random()}`;
      const toast: ToastMessage = {
        id,
        message,
        type,
        duration,
        action,
      };

      setToasts((prev) => [...prev, toast]);
      return id;
    },
    []
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const success = useCallback(
    (message: string, duration?: number, action?: ToastMessage['action']) =>
      addToast(message, 'success', duration, action),
    [addToast]
  );

  const error = useCallback(
    (message: string, duration?: number, action?: ToastMessage['action']) =>
      addToast(message, 'error', duration, action),
    [addToast]
  );

  const warning = useCallback(
    (message: string, duration?: number, action?: ToastMessage['action']) =>
      addToast(message, 'warning', duration, action),
    [addToast]
  );

  const info = useCallback(
    (message: string, duration?: number, action?: ToastMessage['action']) =>
      addToast(message, 'info', duration, action),
    [addToast]
  );

  const value: ToastContextType = {
    addToast,
    removeToast,
    success,
    error,
    warning,
    info,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </ToastContext.Provider>
  );
}

/**
 * Hook to use Toast
 */
export function useToastContext() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToastContext must be used within ToastProvider');
  }
  return context;
}

