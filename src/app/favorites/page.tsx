'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header/Header';
import FavoritesCenterBlock from '@/components/CenterBlock/FavoritesCenterBlock';
import Sidebar from '@/components/Sidebar/Sidebar';
import Bar from '@/components/Bar/Bar';
import styles from '../page.module.css';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setSpecificPlaylist, setFavoriteTracks, setFavoritesLoading } from '@/store/features/trackSlice';
import { ApiClient } from '@/api/client';
import { Track } from '@/types/api';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute/ProtectedRoute';

export default function FavoritesPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { user } = useAuth();

  const { favoriteTracks, isFavoritesLoading } = useAppSelector((state) => state.tracks);

  const loadServerFavorites = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      dispatch(setFavoritesLoading(true));

      const favorites = await ApiClient.getServerFavoriteTracks();

      dispatch(setFavoriteTracks(favorites));

      const favoritesPlaylist = {
        id: -1,
        name: 'Мои треки',
        tracks: favorites
      };
      
      dispatch(setSpecificPlaylist(favoritesPlaylist));

      window.dispatchEvent(new Event('favoritesUpdated'));
      
    } catch (err) {
      console.error('Ошибка загрузки избранных треков:', err);
      setError('Не удалось загрузить избранные треки');

      dispatch(setFavoriteTracks([]));
    } finally {
      setLoading(false);
      dispatch(setFavoritesLoading(false));
    }
  }, [user, dispatch]);

  useEffect(() => {
    if (user) {
      if (favoriteTracks.length > 0) {
        const favoritesPlaylist = {
          id: -1,
          name: 'Мои треки',
          tracks: favoriteTracks
        };
        dispatch(setSpecificPlaylist(favoritesPlaylist));
        setLoading(false);
      } else {
        loadServerFavorites();
      }
    }
  }, [user, favoriteTracks, dispatch, loadServerFavorites]);

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

  if (loading || isFavoritesLoading) {
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
            <FavoritesCenterBlock serverFavorites={favoriteTracks} />
            <Sidebar />
          </main>
          <Bar />
        </div>
      </div>
    </ProtectedRoute>
  );
}