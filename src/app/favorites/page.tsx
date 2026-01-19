'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header/Header';
import FavoritesCenterBlock from '@/components/CenterBlock/FavoritesCenterBlock';
import Sidebar from '@/components/Sidebar/Sidebar';
import Bar from '@/components/Bar/Bar';
import styles from '../page.module.css';
import { useAppDispatch } from '@/store/hooks';
import { setSpecificPlaylist } from '@/store/features/trackSlice';
import { ApiClient } from '@/api/client';
import { Track } from '@/types/api';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute/ProtectedRoute';

export default function FavoritesPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [serverFavorites, setServerFavorites] = useState<Track[]>([]);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      router.push('/signin');
    }
  }, [user, router]);

  const loadServerFavorites = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const favorites = await ApiClient.getServerFavoriteTracks();
      setServerFavorites(favorites);

      const favoritesPlaylist = {
        id: -1,
        name: 'Мои треки',
        tracks: favorites
      };
      
      dispatch(setSpecificPlaylist(favoritesPlaylist));

      localStorage.setItem('favoriteTracks', JSON.stringify(favorites));

      window.dispatchEvent(new Event('favoritesUpdated'));
      
    } catch (err) {
      console.error('Ошибка загрузки избранных треков:', err);
      setError('Не удалось загрузить избранные треки');

      try {
        const favoritesString = localStorage.getItem('favoriteTracks');
        const localFavorites = favoritesString ? JSON.parse(favoritesString) : [];
        
        const favoritesPlaylist = {
          id: -1,
          name: 'Мои треки',
          tracks: localFavorites
        };
        
        dispatch(setSpecificPlaylist(favoritesPlaylist));
        setServerFavorites(localFavorites);
      } catch (localError) {
        console.error('Ошибка загрузки локальных избранных:', localError);
      }
    } finally {
      setLoading(false);
    }
  }, [user, dispatch]);

  useEffect(() => {
    if (user) {
      loadServerFavorites();
    }
  }, [user, loadServerFavorites]);

  useEffect(() => {
    const handleFavoriteUpdated = () => {
      if (user) {
        setTimeout(() => {
          loadServerFavorites();
        }, 500);
      }
    };

    window.addEventListener('favoriteUpdated', handleFavoriteUpdated);
    
    return () => {
      window.removeEventListener('favoriteUpdated', handleFavoriteUpdated);
    };
  }, [user, loadServerFavorites]);

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <div className={styles.wrapper}>
        <div className={styles.container}>
          <main className={styles.main}>
            <Header />
            <div className={styles.centerblock}>
              <div className={styles.loading}>Загрузка избранных треков...</div>
            </div>
            <Sidebar />
          </main>
          <Bar />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.wrapper}>
        <div className={styles.container}>
          <main className={styles.main}>
            <Header />
            <div className={styles.centerblock}>
              <div className={styles.error}>
                {error}
                <button 
                  onClick={loadServerFavorites}
                  style={{
                    marginTop: '10px',
                    padding: '8px 16px',
                    background: '#ad61ff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Попробовать снова
                </button>
              </div>
            </div>
            <Sidebar />
          </main>
          <Bar />
        </div>
      </div>
    );
  }

 return (
    <ProtectedRoute>
      <div className={styles.wrapper}>
        <div className={styles.container}>
          <main className={styles.main}>
            <Header />
            <FavoritesCenterBlock serverFavorites={serverFavorites} />
            <Sidebar />
          </main>
          <Bar />
        </div>
      </div>
    </ProtectedRoute>
  );
}