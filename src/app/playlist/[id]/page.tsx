'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Header from '@/components/Header/Header';
import PlaylistCenterBlock from '@/components/CenterBlock/PlaylistCenterBlock';
import Sidebar from '@/components/Sidebar/Sidebar';
import Bar from '@/components/Bar/Bar';
import styles from '../../page.module.css';
import { ApiClient } from '@/api/client';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setPlaylistTracks, setSpecificPlaylist } from '@/store/features/trackSlice';

export default function PlaylistPage() {
  const params = useParams();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [playlistTitle, setPlaylistTitle] = useState('');
  const dispatch = useAppDispatch();
  const playlistId = params?.id ? Number(params.id) : null;

  const { currentPlaylist } = useAppSelector((state) => state.tracks);

  useEffect(() => {
    const loadPlaylist = async () => {
      if (!playlistId || isNaN(playlistId)) {
        setError('Неверный ID плейлиста');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const defaultTitles: Record<number, string> = {
          1: 'Плейлист дня',
          2: '100 танцевальных хитов',
          3: 'Инди-заряд',
        };
        
        const defaultTitle = defaultTitles[playlistId] || `Плейлист #${playlistId}`;
        setPlaylistTitle(defaultTitle);

        const playlist = await ApiClient.getPlaylistById(playlistId);
        if (playlist.name && playlist.name.trim() !== '') {
          setPlaylistTitle(playlist.name);
        } else {
          setPlaylistTitle(defaultTitle);
        }

        const tracks = playlist.items || playlist.tracks || [];

        const playlistData = {
          id: playlist._id,
          name: playlist.name || defaultTitle,
          tracks: tracks
        };
        
        dispatch(setSpecificPlaylist(playlistData));

        dispatch(setPlaylistTracks(tracks));
        
      } catch (err) {
        console.error('Ошибка загрузки плейлиста:', err);
        setError(err instanceof Error ? err.message : 'Ошибка загрузки подборки');

        const defaultTitles: Record<number, string> = {
          1: 'Плейлист дня',
          2: '100 танцевальных хитов',
          3: 'Инди-заряд',
        };
        
        const fallbackTitle = defaultTitles[playlistId] || `Плейлист #${playlistId}`;
        setPlaylistTitle(fallbackTitle);

        const emptyPlaylist = {
          id: playlistId,
          name: fallbackTitle,
          tracks: []
        };
        
        dispatch(setSpecificPlaylist(emptyPlaylist));
        dispatch(setPlaylistTracks([]));
      } finally {
        setLoading(false);
      }
    };

    loadPlaylist();
  }, [playlistId, dispatch]);

  useEffect(() => {
    if (currentPlaylist && currentPlaylist.name) {
      setPlaylistTitle(currentPlaylist.name);
    }
  }, [currentPlaylist]);

  if (loading) {
    return (
      <div className={styles.wrapper}>
        <div className={styles.container}>
          <div className={styles.loading}>Загрузка подборки...</div>
        </div>
      </div>
    );
  }

  if (error && !playlistTitle) {
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
          <PlaylistCenterBlock title={playlistTitle} />
          <Sidebar />
        </main>
        <Bar />
      </div>
    </div>
  );
}