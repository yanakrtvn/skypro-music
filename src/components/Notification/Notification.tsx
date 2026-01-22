'use client';

import { useState, useEffect } from 'react';
import styles from './Notification.module.css';

interface NotificationProps {
  message: string;
  type: 'success' | 'error' | 'info';
  duration?: number;
  onClose?: () => void;
}

export default function Notification({ 
  message, 
  type, 
  duration = 3000,
  onClose 
}: NotificationProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      if (onClose) {
        setTimeout(onClose, 300);
      }
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!isVisible) return null;

  return (
    <div 
      className={`${styles.notification} ${styles[type]}`}
      style={{
        animation: `${styles.slideIn} 0.3s ease-out`
      }}
    >
      <div className={styles.notificationContent}>
        <span className={styles.notificationMessage}>{message}</span>
        <button 
          className={styles.notificationClose}
          onClick={() => {
            setIsVisible(false);
            if (onClose) onClose();
          }}
        >
          ×
        </button>
      </div>
    </div>
  );
}