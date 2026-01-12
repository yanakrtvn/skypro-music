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

        // Устанавливаем заглушку для быстрого отображения
        const defaultTitles: Record<number, string> = {
          1: 'Плейлист дня',
          2: '100 танцевальных хитов',
          3: 'Инди-заряд',
        };
        
        const defaultTitle = defaultTitles[playlistId] || `Плейлист #${playlistId}`;
        setPlaylistTitle(defaultTitle);

        // Загружаем плейлист из API
        console.log(`Начинаем загрузку плейлиста ${playlistId}...`);
        const playlist = await ApiClient.getPlaylistById(playlistId);
        
        console.log(`Получен плейлист из getPlaylistById:`, {
          id: playlist._id,
          name: playlist.name,
          tracksCount: playlist.items?.length || 0
        });

        // ВАЖНО: Используем название из API, getPlaylistById уже обработал названия
        if (playlist.name && playlist.name.trim() !== '') {
          console.log(`Устанавливаем название из API: "${playlist.name}"`);
          setPlaylistTitle(playlist.name);
        } else {
          // Если API не вернул название, используем дефолтное
          console.log(`API не вернул название, используем дефолтное: "${defaultTitle}"`);
          setPlaylistTitle(defaultTitle);
        }
        
        // Получаем треки из плейлиста
        const tracks = playlist.items || playlist.tracks || [];
        
        console.log(`Треков в плейлисте: ${tracks.length}`);
        
        // Создаем объект плейлиста для Redux
        const playlistData = {
          id: playlist._id,
          name: playlist.name || defaultTitle,
          tracks: tracks
        };
        
        console.log('Сохраняем в Redux:', playlistData);
        
        // Устанавливаем плейлист в Redux
        dispatch(setSpecificPlaylist(playlistData));
        
        // Также устанавливаем треки для отображения
        dispatch(setPlaylistTracks(tracks));
        
      } catch (err) {
        console.error('Ошибка загрузки плейлиста:', err);
        setError(err instanceof Error ? err.message : 'Ошибка загрузки подборки');
        
        // Используем заглушку при ошибке
        const defaultTitles: Record<number, string> = {
          1: 'Плейлист дня',
          2: '100 танцевальных хитов',
          3: 'Инди-заряд',
        };
        
        const fallbackTitle = defaultTitles[playlistId] || `Плейлист #${playlistId}`;
        setPlaylistTitle(fallbackTitle);
        
        // Создаем пустой плейлист при ошибке
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

  // Обновляем заголовок при изменении currentPlaylist из Redux
  useEffect(() => {
    if (currentPlaylist && currentPlaylist.name) {
      console.log('Обновляем заголовок из Redux:', currentPlaylist.name);
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