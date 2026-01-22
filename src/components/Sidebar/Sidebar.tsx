'use client';

import { useEffect, useMemo, useCallback } from 'react';
import styles from './Sidebar.module.css';
import Link from 'next/link';
import Image from 'next/image';
import { ApiClient } from '@/api/client';
import { Playlist } from '@/types/api';
import { useAuth } from '@/context/AuthContext';

export default function Sidebar() {
  const { logout } = useAuth();

  const playlistConfig = useMemo(() => [
    { id: 1, name: 'Плейлист дня', image: '/images/playlist01.png' },
    { id: 2, name: '100 танцевальных хитов', image: '/images/playlist02.png' },
    { id: 3, name: 'Инди-заряд', image: '/images/playlist03.png' },
  ], []);

  const handleLogout = useCallback(() => {
    logout();
  }, [logout]);

  return (
    <div className={styles.sidebar}>
      <div className={styles.sidebar__personal}>
        <div className={styles.sidebar__icon} onClick={handleLogout}>
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
        <div className={styles.sidebar__list}>
          {playlistConfig.map((playlist) => (
            <div key={playlist.id} className={styles.sidebar__item}>
              <Link 
                className={styles.sidebar__link} 
                href={`/playlist/${playlist.id}`}
              >
                <div className={styles.playlist__container}>
                  <Image
                    className={styles.sidebar__img}
                    src={playlist.image}
                    alt={playlist.name}
                    width={250}
                    height={150}
                    priority={playlist.id <= 3}
                    onError={(e) => {
                      console.error(`Не удалось загрузить изображение: ${playlist.image}`);
                      e.currentTarget.src = '/images/default-playlist.jpg';
                    }}
                  />
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}