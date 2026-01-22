'use client';

import { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { setCurrentTrack } from '@/store/features/trackSlice';
import { Track as TrackType } from '@/types/api';
import { useFavorite } from '@/hooks/useFavorites';
import styles from './Track.module.css';

function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

interface TrackProps {
  track: TrackType;
  isInFavoritesPage?: boolean;
}

function TrackComponent({ track, isInFavoritesPage = false }: TrackProps) {
  const { currentTrack, isPlaying, currentPlaylist } = useAppSelector((state) => state.tracks);
  const dispatch = useAppDispatch();
  const { toggleFavorite, checkIfFavorite, loading: favoriteLoading } = useFavorite();
  
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [dynamicLikeCount, setDynamicLikeCount] = useState<number>(0);

  const isFavorite = useMemo(() => 
    checkIfFavorite(track._id), 
    [track._id, checkIfFavorite]
  );

  const baseLikeCount = useMemo(() => 
    track.stared_user?.length || 0, 
    [track.stared_user]
  );

  const localLikeCount = baseLikeCount + dynamicLikeCount;

  const isCurrentTrack = useMemo(() => 
    currentTrack?._id === track._id, 
    [currentTrack, track._id]
  );

  useEffect(() => {
    const handleFavoriteUpdated = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail?.trackId === track._id) {
        if (customEvent.detail.isFavorite) {
          setDynamicLikeCount(prev => prev + 1);
        } else {
          setDynamicLikeCount(prev => Math.max(-baseLikeCount, prev - 1));
        }
      }
    };
    
    const handleTrackLikesUpdated = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail?.trackId === track._id) {
        setDynamicLikeCount(prev => 
          customEvent.detail.isFavorite ? prev + 1 : Math.max(-baseLikeCount, prev - 1)
        );
      }
    };
    
    window.addEventListener('favoriteUpdated', handleFavoriteUpdated);
    window.addEventListener('trackLikesUpdated', handleTrackLikesUpdated);
    
    return () => {
      window.removeEventListener('favoriteUpdated', handleFavoriteUpdated);
      window.removeEventListener('trackLikesUpdated', handleTrackLikesUpdated);
    };
  }, [track._id, baseLikeCount]);

  const handleToggleFavorite = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    try {
      await toggleFavorite(track, isFavorite);
    } catch (error) {
      console.error('Ошибка при переключении лайка:', error);
    }
  }, [track, isFavorite, toggleFavorite]);

  const handleTrackClick = useCallback(() => {
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
  }, [currentPlaylist, isCurrentTrack, track, dispatch]);

  const trackDuration = useMemo(() => 
    formatTime(track.duration_in_seconds), 
    [track.duration_in_seconds]
  );

  return (
    <div 
      className={styles.playlist__item} 
      onClick={handleTrackClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        cursor: 'pointer',
        transition: 'background-color 0.2s ease',
        backgroundColor: isHovered ? 'rgba(173, 97, 255, 0.05)' : 'transparent'
      }}
    >
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
              cursor: favoriteLoading ? 'wait' : 'pointer',
              marginRight: '17px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              transition: 'all 0.2s ease',
              position: 'relative'
            }}
            onMouseEnter={(e) => {
              if (!favoriteLoading) {
                e.currentTarget.style.backgroundColor = 'rgba(173, 97, 255, 0.1)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
            title={isFavorite ? 'Удалить из избранного' : 'Добавить в избранное'}
          >
            {favoriteLoading ? (
              <div className={styles.loadingSpinner}></div>
            ) : (
              <>
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
                
                {/* Счетчик лайков */}
                {localLikeCount > 0 && (
                  <span 
                    style={{
                      position: 'absolute',
                      top: '-8px',
                      right: '-8px',
                      background: isFavorite ? '#ad61ff' : '#696969',
                      color: 'white',
                      borderRadius: '50%',
                      width: '16px',
                      height: '16px',
                      fontSize: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {localLikeCount > 9 ? '9+' : localLikeCount}
                  </span>
                )}
              </>
            )}
          </div>
          <span className={styles.track__timeText}>
            {trackDuration}
          </span>
        </div>
      </div>
    </div>
  );
}

export default memo(TrackComponent);