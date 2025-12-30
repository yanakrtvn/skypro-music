'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Header from '@/components/Header/Header';
import PlaylistCenterBlock from '@/components/CenterBlock/PlaylistCenterBlock';
import Sidebar from '@/components/Sidebar/Sidebar';
import Bar from '@/components/Bar/Bar';
import styles from '../../page.module.css';
import { ApiClient } from '@/api/client';
import { useAppDispatch } from '@/store/hooks';
import { setPlaylistTracks } from '@/store/features/trackSlice';

export default function PlaylistPage() {
  const params = useParams();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [playlistName, setPlaylistName] = useState('');
  const dispatch = useAppDispatch();
  const playlistId = params?.id ? Number(params.id) : null;

  useEffect(() => {
    const loadPlaylist = async () => {
      if (!playlistId || isNaN(playlistId)) {
        setError('Неверный ID плейлиста');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        const playlist = await ApiClient.getPlaylistById(playlistId);
        
        setPlaylistName(playlist.name || 'Плейлист');
        
        const tracks = playlist.items || [];
        
        dispatch(setPlaylistTracks(tracks));
        setError(null);
      } catch (err) {
        console.error('Ошибка загрузки плейлиста:', err);
        setError(err instanceof Error ? err.message : 'Ошибка загрузки подборки');
      } finally {
        setLoading(false);
      }
    };

    loadPlaylist();
  }, [playlistId, dispatch]);

  if (loading) {
    return (
      <div className={styles.wrapper}>
        <div className={styles.container}>
          <div className={styles.loading}>Загрузка подборки...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.wrapper}>
        <div className={styles.container}>
          <div className={styles.error}>Ошибка: {error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <main className={styles.main}>
          <Header />
          <PlaylistCenterBlock title={playlistName} />
          <Sidebar />
        </main>
        <Bar />
      </div>
    </div>
  );
}