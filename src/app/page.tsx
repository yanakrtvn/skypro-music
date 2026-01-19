'use client';

import { useState, useEffect, useCallback } from 'react';
import Header from '@/components/Header/Header';
import CenterBlock from '@/components/CenterBlock/CenterBlock';
import Sidebar from '@/components/Sidebar/Sidebar';
import Bar from '@/components/Bar/Bar';
import LoadingState from '@/components/LoadingState/LoadingState';
import styles from './page.module.css';
import { ApiClient } from '@/api/client';
import { useAppDispatch } from '@/store/hooks';
import { setPlaylistTracks } from '@/store/features/trackSlice';
import { Track as TrackType } from '@/types/api';
import { useNotification } from '@/context/NotificationContext';

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const dispatch = useAppDispatch();
  const { showError } = useNotification();

  const loadTracks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const tracks = await ApiClient.getAllTracks();
      dispatch(setPlaylistTracks(tracks));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка загрузки треков';
      setError(errorMessage);
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [dispatch, showError]);

  useEffect(() => {
    loadTracks();
  }, [loadTracks]);

  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <main className={styles.main}>
          <Header />
          <div className={styles.centerblockWrapper}>
            {loading || error ? (
              <LoadingState 
                isLoading={loading}
                error={error}
                loadingText="Загрузка треков..."
                onRetry={loadTracks}
              />
            ) : (
              <CenterBlock />
            )}
          </div>
          <Sidebar />
        </main>
        <Bar />
      </div>
    </div>
  );
}