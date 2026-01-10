'use client';

import { useState, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { setCurrentTrack } from '@/store/features/trackSlice';
import { Track as TrackType } from '@/types/api';
import styles from './Track.module.css';

function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

export default function Track({ track }: TrackProps) {
  const { currentTrack, isPlaying, currentPlaylist } = useAppSelector((state) => state.tracks);
  const dispatch = useAppDispatch();
  const [isFavorite, setIsFavorite] = useState(false);

  const isCurrentTrack = currentTrack?._id === track._id;

  useEffect(() => {
    const checkIfFavorite = () => {
      try {
        const favoritesString = localStorage.getItem('favoriteTracks');
        const favoriteTracks: TrackType[] = favoritesString ? JSON.parse(favoritesString) : [];
        const isTrackFavorite = favoriteTracks.some(
          (favTrack: TrackType) => favTrack._id === track._id
        );
        setIsFavorite(isTrackFavorite);
      } catch (err) {
        console.error('Ошибка при проверке избранных треков:', err);
        setIsFavorite(false);
      }
    };

    checkIfFavorite();

    const handleFavoritesUpdated = () => {
      checkIfFavorite();
    };

    window.addEventListener('favoritesUpdated', handleFavoritesUpdated);
    
    return () => {
      window.removeEventListener('favoritesUpdated', handleFavoritesUpdated);
    };
  }, [track._id]);

  useEffect(() => {
    const handleCurrentTrackFavoriteUpdated = (e: CustomEvent) => {
      if (isCurrentTrack && e.detail?.isFavorite !== undefined) {
        setIsFavorite(e.detail.isFavorite);
      }
    };

    window.addEventListener('currentTrackFavoriteUpdated', handleCurrentTrackFavoriteUpdated as EventListener);
    
    return () => {
      window.removeEventListener('currentTrackFavoriteUpdated', handleCurrentTrackFavoriteUpdated as EventListener);
    };
  }, [isCurrentTrack]);

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    try {
      const favoritesString = localStorage.getItem('favoriteTracks');
      const favoriteTracks: TrackType[] = favoritesString ? JSON.parse(favoritesString) : [];
      
      const trackIndex = favoriteTracks.findIndex(
        (favTrack: TrackType) => favTrack._id === track._id
      );
      
      let updatedFavorites: TrackType[];
      let newFavoriteState: boolean;
      
      if (trackIndex === -1) {
        updatedFavorites = [...favoriteTracks, track];
        newFavoriteState = true;
        setIsFavorite(true);
      } else {
        updatedFavorites = favoriteTracks.filter(
          (favTrack: TrackType) => favTrack._id !== track._id
        );
        newFavoriteState = false;
        setIsFavorite(false);
      }
      
      localStorage.setItem('favoriteTracks', JSON.stringify(updatedFavorites));
      window.dispatchEvent(new Event('favoritesUpdated'));

      if (isCurrentTrack) {
        const event = new CustomEvent('currentTrackFavoriteUpdated', {
          detail: { isFavorite: newFavoriteState }
        });
        window.dispatchEvent(event);
      }
      
      console.log(`Трек "${track.name}" ${newFavoriteState ? 'добавлен в' : 'удален из'} избранные`);
      
    } catch (err) {
      console.error('Ошибка при обновлении избранных:', err);
    }
  };

  const handleTrackClick = () => {
    if (!currentPlaylist) {
      console.error('No current playlist');
      return;
    }
    
    if (!isCurrentTrack) {
      dispatch(setCurrentTrack({ 
        track, 
        playlist: currentPlaylist 
      }));
    }
  };

  return (
    <div className={styles.playlist__item} onClick={handleTrackClick}>
      <div className={styles.playlist__track}>
        <div className={styles.track__title}>
          <div className={styles.track__titleImage}>
            {isCurrentTrack ? (
              <div className={`${styles.currentTrackDot} ${isPlaying ? styles.pulsing : ''}`}>
                <div className={styles.dotInner}></div>
              </div>
            ) : (
              <img 
                src="/images/icon/note.svg" 
                alt="Note icon" 
                className={styles.track__titleSvg}
              />
            )}
          </div>
          <div className={styles.track__titleText}>
            <div className={styles.track__titleLink}>
              {track.name}
              {(!track.track_file || track.track_file === '') && (
                <span style={{ color: 'red', fontSize: '10px', marginLeft: '5px' }}>
                  (нет аудио)
                </span>
              )}
            </div>
          </div>
        </div>
        
        <div className={styles.track__author}>
          <div className={styles.track__authorLink}>
            {track.author}
          </div>
        </div>
        
        <div className={styles.track__album}>
          <div className={styles.track__albumLink}>
            {track.album}
          </div>
        </div>
        
        <div className={styles.track__time}>
          <div 
            onClick={handleToggleFavorite}
            style={{ 
              cursor: 'pointer',
              marginRight: '17px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              transition: 'background-color 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(173, 97, 255, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <svg 
              width="14" 
              height="12" 
              viewBox="0 0 14 12"
              fill={isFavorite ? "#ad61ff" : "none"}
              stroke={isFavorite ? "#ad61ff" : "#696969"}
              strokeWidth="2"
              style={{
                transition: 'all 0.2s ease'
              }}
            >
              <path d="M6.65242 1.89789C7.92929 0.420498 10.0241 0.282701 11.3595 1.70955C12.6948 3.1364 12.7837 5.46349 11.6265 6.99496L6.49976 12L1.37305 6.99496C0.215841 5.46349 0.304779 3.1364 1.64012 1.70955C2.97547 0.282701 5.07025 0.420498 6.34712 1.89789L6.49976 2.06847L6.65242 1.89789Z" />
            </svg>
          </div>
          <span className={styles.track__timeText}>
            {formatTime(track.duration_in_seconds)}
          </span>
        </div>
      </div>
    </div>
  );
}

interface TrackProps {
  track: TrackType;
}