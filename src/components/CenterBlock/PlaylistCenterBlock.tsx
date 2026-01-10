'use client';

import { useAppSelector } from '@/store/hooks';
import Track from '@/components/Track/Track';
import styles from './CenterBlock.module.css';
import { Track as TrackType } from '@/types/api';

interface PlaylistCenterBlockProps {
  title: string;
}

export default function PlaylistCenterBlock({ title }: PlaylistCenterBlockProps) {
  const { playlistTracks } = useAppSelector((state) => state.tracks);
  
  const tracks = playlistTracks || [];
  
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
            tracks
              .filter((track: TrackType) => track && track._id !== undefined && typeof track === 'object')
              .map((track: TrackType, index: number) => {
                console.log(`Трек ${index}:`, track);
                return (
                  <Track 
                    key={`playlist-${track._id}-${index}-${track.name}`}
                    track={track} 
                  />
                );
              })
          ) : (
            <div className={styles.emptyPlaylist}>
              В данном плейлисте пока нет треков
            </div>
          )}
        </div>
      </div>
    </div>
  );
}