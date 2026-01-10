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

  const getPlaylistImage = (playlistId: number): string => {
    const imageMap: Record<number, string> = {
      1: '/images/playlist01.png',
      2: '/images/playlist02.png',
      3: '/images/playlist03.png',
    };
    
    return imageMap[playlistId] || `/images/playlist01.png`;
  };

  const getPlaylistNameById = (id: number): string => {
    const nameMap: Record<number, string> = {
      1: 'Плейлист дня',
      2: '100 танцевальных хитов',
      3: 'Инди-заряд',
    };
    
    return nameMap[id] || `Плейлист #${id}`;
  };

  const sidebarPlaylistOrder = [1, 2, 3]; 
  useEffect(() => {
    const loadPlaylists = async () => {
      try {
        setLoading(true);
        const playlistsData = await ApiClient.getPlaylists();
        const finalPlaylists: Playlist[] = [];
        
        sidebarPlaylistOrder.forEach(id => {
          const playlistFromApi = playlistsData.find(p => p && p._id === id);
          
          if (playlistFromApi) {
            finalPlaylists.push({
              ...playlistFromApi,
              _id: id,
              name: getPlaylistNameById(id)
            });
          } else {
            finalPlaylists.push({
              _id: id,
              name: getPlaylistNameById(id),
              items: [],
              tracks: []
            });
          }
        });
        
        setPlaylists(finalPlaylists);
        setError(null);
      } catch (err) {
        console.error('Error loading playlists:', err);
        const manualPlaylists: Playlist[] = sidebarPlaylistOrder.map(id => ({
          _id: id,
          name: getPlaylistNameById(id),
          items: [],
          tracks: []
        }));
        
        setPlaylists(manualPlaylists);
        setError('Ошибка загрузки подборок, отображены базовые плейлисты');
      } finally {
        setLoading(false);
      }
    };

    loadPlaylists();
  }, []);

  const processedPlaylists = useMemo(() => {
    return playlists.map(playlist => ({
      ...playlist,
      imageUrl: getPlaylistImage(playlist._id)
    }));
  }, [playlists]);

  return (
    <div className={styles.sidebar}>
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
              const playlistId = String(playlist._id);
              
              return (
                <div key={playlist._id} className={styles.sidebar__item}>
                  <Link 
                    className={styles.sidebar__link} 
                    href={`/playlist/${playlistId}`}
                  >
                    <div className={styles.playlist__container}>
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
                    </div>
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