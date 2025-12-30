'use client';

import { useAppSelector } from '@/store/hooks';
import Track from '@/components/Track/Track';
import styles from './CenterBlock.module.css';

interface PlaylistCenterBlockProps {
  title: string;
}

export default function PlaylistCenterBlock({ title }: PlaylistCenterBlockProps) {
  const { currentPlaylist } = useAppSelector((state) => state.tracks);
  
  const tracks = currentPlaylist?.tracks || [];

  return (
    <div className={styles.centerblock}>
      <h2 className={styles.centerblock__h2}>{title}</h2>
      
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
          {tracks.length > 0 ? (
            tracks.map(track => (
              <Track key={track._id} track={track} />
            ))
          ) : (
            <div className={styles.noTracks}>Нет треков в плейлисте</div>
          )}
        </div>
      </div>
    </div>
  );
}