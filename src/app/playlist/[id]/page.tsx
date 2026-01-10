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

const getPlaylistNameById = (id: number): string => {
  const nameMap: Record<number, string> = {
    1: 'Плейлист дня',
    2: '100 танцевальных хитов',
    3: 'Инди-заряд',
  };
  
  return nameMap[id] || `Плейлист #${id}`;
};

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
        
        const defaultName = getPlaylistNameById(playlistId);
        setPlaylistName(defaultName);

        const playlist = await ApiClient.getPlaylistById(playlistId);

        if (playlist.name && playlist.name.trim() !== '') {
          setPlaylistName(playlist.name);
        }
        
        const tracks = playlist.items || playlist.tracks || [];
        
        console.log(`Загружен плейлист "${defaultName}" с ${tracks.length} треками`);
        
        dispatch(setPlaylistTracks(tracks));
        setError(null);
      } catch (err) {
        console.error('Ошибка загрузки плейлиста:', err);
        setError(err instanceof Error ? err.message : 'Ошибка загрузки подборки');

        const defaultName = getPlaylistNameById(playlistId);
        setPlaylistName(defaultName);
        dispatch(setPlaylistTracks([]));
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

  if (error && !playlistName) {
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