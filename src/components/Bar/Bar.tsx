'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { 
  togglePlay, 
  setVolume, 
  setLoop, 
  setShuffle, 
  nextTrack, 
  prevTrack, 
  seekToTime,
  setDuration,
  setCurrentTime 
} from '@/store/features/trackSlice';
import { useFavorite } from '@/hooks/useFavorites';
import styles from './Bar.module.css';
import { Track as TrackType } from '@/types/api';

function formatTime(seconds: number): string {
  if (isNaN(seconds)) return '0:00';
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

export default function Bar() {
  const { 
    currentTrack, 
    isPlaying, 
    volume, 
    duration, 
    currentTime,
    loop,
    shuffle
  } = useAppSelector((state) => state.tracks);
  const dispatch = useAppDispatch();
  
  const [isDragging, setIsDragging] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const progressBarRef = useRef<HTMLDivElement>(null);
  
  const { toggleFavorite, checkIfFavorite, loading: favoriteLoading } = useFavorite();

  useEffect(() => {
    const updateFavoriteStatus = () => {
      if (currentTrack) {
        const isTrackFavorite = checkIfFavorite(currentTrack._id);
        setIsFavorite(isTrackFavorite);
        setLikeCount(currentTrack.stared_user?.length || 0);
      } else {
        setIsFavorite(false);
        setLikeCount(0);
      }
    };

    updateFavoriteStatus();
    
    const handleFavoriteUpdated = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (currentTrack && customEvent.detail?.trackId === currentTrack._id) {
        setIsFavorite(customEvent.detail.isFavorite);

        setIsAnimating(true);
        setTimeout(() => setIsAnimating(false), 300);

        if (customEvent.detail.isFavorite) {
          setLikeCount(prev => prev + 1);
        } else {
          setLikeCount(prev => Math.max(0, prev - 1));
        }
      }
    };

    const handleTrackLikesUpdated = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (currentTrack && customEvent.detail?.trackId === currentTrack._id) {
        setLikeCount(prev => 
          customEvent.detail.isFavorite ? prev + 1 : Math.max(0, prev - 1)
        );
      }
    };

    window.addEventListener('favoriteUpdated', handleFavoriteUpdated);
    window.addEventListener('trackLikesUpdated', handleTrackLikesUpdated);
    
    return () => {
      window.removeEventListener('favoriteUpdated', handleFavoriteUpdated);
      window.removeEventListener('trackLikesUpdated', handleTrackLikesUpdated);
    };
  }, [currentTrack, checkIfFavorite]);

  const handleToggleFavorite = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentTrack) return;
    
    try {
      await toggleFavorite(currentTrack, isFavorite);
    } catch (err) {
      console.error('Ошибка при обновлении избранного в плеере:', err);
    }
  }, [currentTrack, isFavorite, toggleFavorite]);

  const handleTrackEnd = useCallback(() => {
    if (loop) {
      dispatch(seekToTime(0));
      const audioElement = document.querySelector('audio') as HTMLAudioElement;
      if (audioElement) {
        audioElement.currentTime = 0;
        audioElement.play().catch(console.error);
      }
    } else {
      const audioElement = document.querySelector('audio') as HTMLAudioElement;
      if (audioElement) {
        audioElement.pause();
      }
      
      setTimeout(() => {
        dispatch(nextTrack());
      }, 100);
    }
  }, [loop, dispatch]);

  useEffect(() => {
    const audioElement = document.querySelector('audio');
    if (!audioElement) return;

    const handleTimeUpdate = () => {
      dispatch(setCurrentTime(audioElement.currentTime));
      if (!isNaN(audioElement.duration)) {
        dispatch(setDuration(audioElement.duration));
      }
    };

    const handleLoadedData = () => {
      if (!isNaN(audioElement.duration)) {
        dispatch(setDuration(audioElement.duration));
      }
    };

    audioElement.addEventListener('timeupdate', handleTimeUpdate);
    audioElement.addEventListener('loadeddata', handleLoadedData);
    audioElement.addEventListener('ended', handleTrackEnd);

    return () => {
      audioElement.removeEventListener('timeupdate', handleTimeUpdate);
      audioElement.removeEventListener('loadeddata', handleLoadedData);
      audioElement.removeEventListener('ended', handleTrackEnd);
    };
  }, [dispatch, handleTrackEnd]);

  useEffect(() => {
    const audioElement = document.querySelector('audio');
    if (audioElement) {
      audioElement.volume = volume;
    }
  }, [volume]);

  const handlePlayPause = useCallback(() => {
    dispatch(togglePlay());
  }, [dispatch]);

  const handleNextTrack = useCallback(() => {
    dispatch(nextTrack());
  }, [dispatch]);

  const handlePrevTrack = useCallback(() => {
    dispatch(prevTrack());
  }, [dispatch]);

  const handleShuffle = useCallback(() => {
    dispatch(setShuffle(!shuffle));
  }, [shuffle, dispatch]);

  const handleLoop = useCallback(() => {
    dispatch(setLoop(!loop));
  }, [loop, dispatch]);

  const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    dispatch(setVolume(newVolume));
  }, [dispatch]);

  const handleProgressClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current || !duration) return;
    
    const rect = progressBarRef.current.getBoundingClientRect();
    const clickPosition = (e.clientX - rect.left) / rect.width;
    const newTime = clickPosition * duration;
    
    dispatch(seekToTime(newTime));
    
    const audioElement = document.querySelector('audio') as HTMLAudioElement;
    if (audioElement) {
      audioElement.currentTime = newTime;
    }
  }, [duration, dispatch]);

  const handleProgressDrag = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !progressBarRef.current || !duration) return;
    
    const rect = progressBarRef.current.getBoundingClientRect();
    const clickPosition = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const newTime = clickPosition * duration;
    
    dispatch(setCurrentTime(newTime));
  }, [isDragging, duration, dispatch]);

  const handleProgressMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
    handleProgressDrag(e);
    
    const handleMouseMove = (moveEvent: MouseEvent) => {
      handleProgressDrag(moveEvent as unknown as React.MouseEvent<HTMLDivElement>);
    };
    
    const handleMouseUp = () => {
      setIsDragging(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [handleProgressDrag]);

  const progressPercentage = useMemo(() => 
    duration > 0 ? (currentTime / duration) * 100 : 0, 
    [duration, currentTime]
  );
  
  const volumePercentage = useMemo(() => 
    volume * 100, 
    [volume]
  );

  if (!currentTrack) {
    return null;
  }

  return (
    <div className={styles.bar}>
      <div className={styles.bar__content}>
        <div 
          className={styles.bar__playerProgress}
          ref={progressBarRef}
          onClick={handleProgressClick}
          onMouseDown={handleProgressMouseDown}
          style={{ cursor: 'pointer', position: 'relative' }}
        >
          <div 
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              height: '100%',
              width: `${progressPercentage}%`,
              background: '#ad61ff',
              transition: isDragging ? 'none' : 'width 0.1s linear'
            }}
          />
        </div>
        
        <div className={styles.bar__playerBlock}>
          <div className={styles.bar__player}>
            <div className={styles.player__controls}>
              {/* Кнопка предыдущего трека */}
              <div 
                className={styles.player__btnPrev} 
                onClick={handlePrevTrack}
                style={{ cursor: 'pointer' }}
              >
                <svg className={styles.player__btnPrevSvg}>
                  <use xlinkHref="/images/icon/sprite.svg#icon-prev"></use>
                </svg>
              </div>
              
              {/* Кнопка play/pause */}
              <div 
                className={styles.player__btnPlay} 
                onClick={handlePlayPause}
                style={{ cursor: 'pointer' }}
              >
                <svg className={styles.player__btnPlaySvg}>
                  <use xlinkHref={`/images/icon/sprite.svg#${isPlaying ? 'icon-pause' : 'icon-play'}`}></use>
                </svg>
              </div>
              
              {/* Кнопка следующего трека */}
              <div 
                className={styles.player__btnNext} 
                onClick={handleNextTrack}
                style={{ cursor: 'pointer' }}
              >
                <svg className={styles.player__btnNextSvg}>
                  <use xlinkHref="/images/icon/sprite.svg#icon-next"></use>
                </svg>
              </div>
              
              {/* Кнопка повтора */}
              <div 
                className={`${styles.player__btnRepeat} ${loop ? styles.btnActive : ''}`}
                onClick={handleLoop}
                style={{ cursor: 'pointer' }}
              >
                <svg className={styles.player__btnRepeatSvg}>
                  <use xlinkHref="/images/icon/sprite.svg#icon-repeat"></use>
                </svg>
              </div>
              
              {/* Кнопка перемешивания */}
              <div 
                className={`${styles.player__btnShuffle} ${shuffle ? styles.btnActive : ''}`}
                onClick={handleShuffle}
                style={{ cursor: 'pointer' }}
              >
                <svg className={styles.player__btnShuffleSvg}>
                  <use xlinkHref="/images/icon/sprite.svg#icon-shuffle"></use>
                </svg>
              </div>
            </div>

            <div className={styles.player__trackPlay}>
              <div className={styles.trackPlay__contain}>
                <div className={styles.trackPlay__image}>
                  <img 
                    src="/images/icon/note.svg" 
                    alt="Note icon" 
                    className={styles.trackPlay__svg}
                  />
                </div>
                <div className={styles.trackPlay__author}>
                  <span className={styles.trackPlay__authorLink}>{currentTrack.name}</span>
                </div>
                <div className={styles.trackPlay__album}>
                  <span className={styles.trackPlay__albumLink}>{currentTrack.author}</span>
                </div>
              </div>
              
              <div className={styles.trackPlay__likeDislike}>
                <div 
                  className={styles.trackPlay__likeWrapper}
                  onClick={handleToggleFavorite}
                  style={{ 
                    cursor: favoriteLoading ? 'wait' : 'pointer',
                    padding: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative'
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
                          transition: 'all 0.2s ease',
                          transform: isAnimating ? 'scale(1.3)' : 'scale(1)'
                        }}
                      >
                        <path d="M6.65242 1.89789C7.92929 0.420498 10.0241 0.282701 11.3595 1.70955C12.6948 3.1364 12.7837 5.46349 11.6265 6.99496L6.49976 12L1.37305 6.99496C0.215841 5.46349 0.304779 3.1364 1.64012 1.70955C2.97547 0.282701 5.07025 0.420498 6.34712 1.89789L6.49976 2.06847L6.65242 1.89789Z" />
                      </svg>
                      
                      {/* Счетчик лайков */}
                      {likeCount > 0 && (
                        <span 
                          style={{
                            position: 'absolute',
                            top: '2px',
                            right: '2px',
                            background: isFavorite ? '#ad61ff' : '#696969',
                            color: 'white',
                            borderRadius: '50%',
                            width: '14px',
                            height: '14px',
                            fontSize: '9px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          {likeCount > 9 ? '9+' : likeCount}
                        </span>
                      )}
                    </>
                  )}
                </div>
                
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  marginLeft: '20px',
                  fontSize: '14px',
                  color: '#696969'
                }}>
                  <span>{formatTime(currentTime)}</span>
                  <span style={{ margin: '0 5px' }}>/</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className={styles.bar__volumeBlock}>
            <div className={styles.volume__content}>
              <div className={styles.volume__image}>
                <svg className={styles.volume__svg}>
                  <use xlinkHref="/images/icon/sprite.svg#icon-volume"></use>
                </svg>
              </div>
              <div className={styles.volume__progress}>
                <input
                  className={styles.volume__progressLine}
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={volume}
                  onChange={handleVolumeChange}
                  style={{
                    background: `linear-gradient(to right, #ad61ff ${volumePercentage}%, #797979 ${volumePercentage}%)`
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}