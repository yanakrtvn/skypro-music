'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header/Header';
import FavoritesCenterBlock from '@/components/CenterBlock/FavoritesCenterBlock';
import Sidebar from '@/components/Sidebar/Sidebar';
import Bar from '@/components/Bar/Bar';
import styles from '../page.module.css';
import { useAppDispatch } from '@/store/hooks';
import { setSpecificPlaylist } from '@/store/features/trackSlice';

export default function FavoritesPage() {
  const [loading, setLoading] = useState(true);
  const dispatch = useAppDispatch();

  useEffect(() => {
    const loadFavorites = () => {
      try {
        setLoading(true);
        
        const favoritesString = localStorage.getItem('favoriteTracks');
        const favoriteTracks = favoritesString ? JSON.parse(favoritesString) : [];
        
        const favoritesPlaylist = {
          id: -1,
          name: 'Мои треки',
          tracks: favoriteTracks
        };
        
        dispatch(setSpecificPlaylist(favoritesPlaylist));
      } catch (err) {
        console.error('Ошибка загрузки избранных треков:', err);
      } finally {
        setLoading(false);
      }
    };

    loadFavorites();
  }, [dispatch]);

  if (loading) {
    return (
      <div className={styles.wrapper}>
        <div className={styles.container}>
          <div className={styles.loading}>Загрузка...</div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <main className={styles.main}>
          <Header />
          <FavoritesCenterBlock />
          <Sidebar />
        </main>
        <Bar />
      </div>
    </div>
  );
}