'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import Notification from '@/components/Notification/Notification';

interface NotificationItem {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface NotificationContextType {
  showNotification: (message: string, type: 'success' | 'error' | 'info') => void;
  showError: (message: string) => void;
  showSuccess: (message: string) => void;
  showInfo: (message: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider');
  }
  return context;
};

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const removeNotification = useCallback((id: number) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const showNotification = useCallback((message: string, type: 'success' | 'error' | 'info') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
    
    setTimeout(() => {
      removeNotification(id);
    }, 5000);
  }, [removeNotification]);

  const showError = useCallback((message: string) => {
    showNotification(message, 'error');
  }, [showNotification]);

  const showSuccess = useCallback((message: string) => {
    showNotification(message, 'success');
  }, [showNotification]);

  const showInfo = useCallback((message: string) => {
    showNotification(message, 'info');
  }, [showNotification]);

  return (
    <NotificationContext.Provider value={{ 
      showNotification, 
      showError, 
      showSuccess, 
      showInfo 
    }}>
      {children}
      <div style={{
        position: 'fixed',
        top: 0,
        right: 0,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        padding: '20px',
        pointerEvents: 'none'
      }}>
        {notifications.map(notification => (
          <div key={notification.id} style={{ pointerEvents: 'auto' }}>
            <Notification
              message={notification.message}
              type={notification.type}
              onClose={() => removeNotification(notification.id)}
            />
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
}