'use client';

import { useState, useEffect } from 'react';
import Track from '@/components/Track/Track';
import styles from './CenterBlock.module.css';
import { useAppSelector } from '@/store/hooks';
import { Track as TrackType } from '@/types/api';

export default function FavoritesCenterBlock() {
  const [favoriteTracks, setFavoriteTracks] = useState<TrackType[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentPlaylist } = useAppSelector((state) => state.tracks);

  const loadFavorites = () => {
    try {
      const favoritesString = localStorage.getItem('favoriteTracks');
      const tracks = favoritesString ? JSON.parse(favoritesString) : [];
      setFavoriteTracks(tracks);
    } catch (err) {
      console.error('Ошибка загрузки избранных треков:', err);
      setFavoriteTracks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadFavorites();
    }, 0);
    
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleFavoritesUpdated = () => {
      loadFavorites();
    };

    window.addEventListener('favoritesUpdated', handleFavoritesUpdated);
    
    return () => {
      window.removeEventListener('favoritesUpdated', handleFavoritesUpdated);
    };
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentPlaylist?.id === -1) {
        setFavoriteTracks(currentPlaylist.tracks);
      }
    }, 0);
    
    return () => clearTimeout(timer);
  }, [currentPlaylist]);

  if (loading) {
    return (
      <div className={styles.centerblock}>
        <div className={styles.loading}>Загрузка избранных...</div>
      </div>
    );
  }

  return (
    <div className={styles.centerblock}>
      <h2 className={styles.centerblock__h2}>Мои треки</h2>
      
      <div className={styles.centerblock__content}>
        <div className={styles.content__title}>
          <div className={`${styles.playlistTitle__col} ${styles.col01}`}>ТРЕК</div>
          <div className={`${styles.playlistTitle__col} ${styles.col02}`}>ИСПОЛНИТЕЛЬ</div>
          <div className={`${styles.playlistTitle__col} ${styles.col03}`}>АЛЬБОМ</div>
          <div className={`${styles.playlistTitle__col} ${styles.col04}`}>
            <svg className={styles.playlistTitle__svg}>
              <use xlinkHref="/images/icon/sprite.svg#icon-watch"></use>
            </svg>
          </div>
        </div>
        
        <div className={styles.content__playlist}>
          {favoriteTracks.length > 0 ? (
            favoriteTracks.map(track => (
              <Track key={track._id} track={track} />
            ))
          ) : (
            <div className={styles.noTracks}>
              Здесь пока нет треков. Добавьте их, нажав на сердечко!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}