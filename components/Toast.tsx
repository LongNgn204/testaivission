import React, { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle, AlertTriangle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastProps {
  toast: ToastMessage;
  onClose: (id: string) => void;
}

/**
 * Individual Toast Component
 */
function Toast({ toast, onClose }: ToastProps) {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (!toast.duration) return;

    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => onClose(toast.id), 300);
    }, toast.duration);

    return () => clearTimeout(timer);
  }, [toast.duration, toast.id, onClose]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => onClose(toast.id), 300);
  };

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle className="w-5 h-5" />;
      case 'error':
        return <AlertCircle className="w-5 h-5" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5" />;
      case 'info':
        return <Info className="w-5 h-5" />;
    }
  };

  const getColors = () => {
    switch (toast.type) {
      case 'success':
        return {
          bg: 'bg-green-50 dark:bg-green-900',
          border: 'border-green-200 dark:border-green-700',
          text: 'text-green-800 dark:text-green-100',
          icon: 'text-green-600 dark:text-green-400',
        };
      case 'error':
        return {
          bg: 'bg-red-50 dark:bg-red-900',
          border: 'border-red-200 dark:border-red-700',
          text: 'text-red-800 dark:text-red-100',
          icon: 'text-red-600 dark:text-red-400',
        };
      case 'warning':
        return {
          bg: 'bg-yellow-50 dark:bg-yellow-900',
          border: 'border-yellow-200 dark:border-yellow-700',
          text: 'text-yellow-800 dark:text-yellow-100',
          icon: 'text-yellow-600 dark:text-yellow-400',
        };
      case 'info':
        return {
          bg: 'bg-blue-50 dark:bg-blue-900',
          border: 'border-blue-200 dark:border-blue-700',
          text: 'text-blue-800 dark:text-blue-100',
          icon: 'text-blue-600 dark:text-blue-400',
        };
    }
  };

  const colors = getColors();

  return (
    <div
      className={`transform transition-all duration-300 ${
        isExiting ? 'opacity-0 translate-x-full' : 'opacity-100 translate-x-0'
      }`}
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <div
        className={`${colors.bg} ${colors.border} ${colors.text} border rounded-lg shadow-lg p-4 flex items-start gap-3 max-w-md`}
        role="alert"
      >
        {/* Icon */}
        <div className={`flex-shrink-0 ${colors.icon} mt-0.5`}>{getIcon()}</div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium break-words">{toast.message}</p>
          {toast.action && (
            <button
              onClick={toast.action.onClick}
              className={`text-xs font-semibold mt-2 underline hover:opacity-75 transition-opacity`}
            >
              {toast.action.label}
            </button>
          )}
        </div>

        {/* Close Button */}
        <button
          onClick={handleClose}
          className={`flex-shrink-0 ${colors.icon} hover:opacity-75 transition-opacity`}
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

/**
 * Toast Container Component
 */
interface ToastContainerProps {
  toasts: ToastMessage[];
  onClose: (id: string) => void;
}

export function ToastContainer({ toasts, onClose }: ToastContainerProps) {
  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2 pointer-events-auto">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onClose={onClose} />
      ))}
    </div>
  );
}

/**
 * Toast Manager Hook
 */
export function useToast() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (
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
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const success = (message: string, duration?: number, action?: ToastMessage['action']) =>
    addToast(message, 'success', duration, action);

  const error = (message: string, duration?: number, action?: ToastMessage['action']) =>
    addToast(message, 'error', duration, action);

  const warning = (message: string, duration?: number, action?: ToastMessage['action']) =>
    addToast(message, 'warning', duration, action);

  const info = (message: string, duration?: number, action?: ToastMessage['action']) =>
    addToast(message, 'info', duration, action);

  return {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    warning,
    info,
  };
}

