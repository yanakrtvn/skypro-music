'use client';

import { memo } from 'react';
import styles from './LoadingState.module.css';

interface LoadingStateProps {
  isLoading?: boolean;
  error?: string | null;
  loadingText?: string;
  onRetry?: () => void;
}

function LoadingStateComponent({ 
  isLoading = false, 
  error = null, 
  loadingText = 'Загрузка...',
  onRetry 
}: LoadingStateProps) {
  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <div className={styles.loadingText}>{loadingText}</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorIcon}>!</div>
        <div className={styles.errorText}>{error}</div>
        {onRetry && (
          <button 
            className={styles.retryButton}
            onClick={onRetry}
          >
            Попробовать снова
          </button>
        )}
      </div>
    );
  }

  return null;
}

export default memo(LoadingStateComponent);