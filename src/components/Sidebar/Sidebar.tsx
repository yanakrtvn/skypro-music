'use client';

import { useState, useEffect, useMemo } from 'react';
import styles from './Sidebar.module.css';
import Link from 'next/link';
import Image from 'next/image';
import { ApiClient } from '@/api/client';
import { Playlist } from '@/types/api';
import { useAuth } from '@/context/AuthContext';

export default function Sidebar() {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, logout } = useAuth();

  const getPlaylistImage = (id: number): string => {
    const imageNumber = (id % 3) + 1;
    return `/images/playlist0${imageNumber}.png`;
  };

  const processedPlaylists = useMemo(() => {
    return playlists.map(playlist => ({
      ...playlist,
      name: playlist.name || `Плейлист ${playlist._id}`,
      imageUrl: getPlaylistImage(playlist._id)
    }));
  }, [playlists]);

  useEffect(() => {
    const loadPlaylists = async () => {
      try {
        setLoading(true);
        const playlistsData = await ApiClient.getPlaylists();
               
        const validPlaylists = playlistsData.filter(playlist => {
          if (!playlist || typeof playlist !== 'object') {
            console.warn('Некорректный плейлист:', playlist);
            return false;
          }
          
          if (!playlist._id || typeof playlist._id !== 'number') {
            console.warn('Плейлист без ID:', playlist);
            return false;
          }
          
          return true;
        });
        
        const uniquePlaylists = validPlaylists.slice(0, 3);
        
        setPlaylists(uniquePlaylists);
        setError(null);
      } catch (err) {
        console.error('Error loading playlists:', err);
        setError('Ошибка загрузки подборок');
        setPlaylists([]);
      } finally {
        setLoading(false);
      }
    };

    loadPlaylists();
  }, []);

  return (
    <div className={styles.sidebar}>
      {user && (
        <div className={styles.sidebar__personal}>
          <div className={styles.sidebar__icon} onClick={logout}>
            <Image
              src="/images/icon/выход.svg"
              alt="Выйти"
              width={20}
              height={20}
              className={styles.sidebar__iconImg}
            />
          </div>
        </div>
      )}
      
      <div className={styles.sidebar__block}>
        {loading ? (
          <div className={styles.loading}>Загрузка подборок...</div>
        ) : error ? (
          <div className={styles.error}>{error}</div>
        ) : processedPlaylists.length === 0 ? (
          <div className={styles.noPlaylists}>Нет подборок</div>
        ) : (
          <div className={styles.sidebar__list}>
            {processedPlaylists.map((playlist) => {
              if (typeof playlist._id !== 'number' || isNaN(playlist._id)) {
                console.error('Invalid playlist ID:', playlist._id, playlist);
                return null;
              }
              
              const playlistId = String(playlist._id);
              
              return (
                <div key={playlist._id} className={styles.sidebar__item}>
                  <Link 
                    className={styles.sidebar__link} 
                    href={`/playlist/${playlistId}`}
                  >
                    <Image
                      className={styles.sidebar__img}
                      src={playlist.imageUrl}
                      alt={`${playlist.name}`}
                      width={250}
                      height={150}
                      priority={playlist._id <= 3}
                      onError={(e) => {
                        console.error(`Не удалось загрузить изображение: ${playlist.imageUrl}`);
                        e.currentTarget.src = '/images/default-playlist.jpg';
                      }}
                    />
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}