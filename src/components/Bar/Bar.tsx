'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
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
  const progressBarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkIfFavorite = () => {
      if (currentTrack) {
        try {
          const favoritesString = localStorage.getItem('favoriteTracks');
          const favoriteTracks: TrackType[] = favoritesString ? JSON.parse(favoritesString) : [];
          const isTrackFavorite = favoriteTracks.some(
            (track: TrackType) => track._id === currentTrack._id
          );
          setIsFavorite(isTrackFavorite);
        } catch (err) {
          console.error('Ошибка при проверке избранных треков:', err);
          setIsFavorite(false);
        }
      } else {
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
  }, [currentTrack]);

  useEffect(() => {
    const handleCurrentTrackFavoriteUpdated = (e: CustomEvent) => {
      if (e.detail?.isFavorite !== undefined) {
        setIsFavorite(e.detail.isFavorite);
      }
    };

    window.addEventListener('currentTrackFavoriteUpdated', handleCurrentTrackFavoriteUpdated as EventListener);
    
    return () => {
      window.removeEventListener('currentTrackFavoriteUpdated', handleCurrentTrackFavoriteUpdated as EventListener);
    };
  }, []);

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentTrack) return;
    
    try {
      const favoritesString = localStorage.getItem('favoriteTracks');
      const favoriteTracks: TrackType[] = favoritesString ? JSON.parse(favoritesString) : [];
      
      const trackIndex = favoriteTracks.findIndex(
        (track: TrackType) => track._id === currentTrack._id
      );
      
      if (trackIndex === -1) {
        const updatedFavorites = [...favoriteTracks, currentTrack];
        localStorage.setItem('favoriteTracks', JSON.stringify(updatedFavorites));
        setIsFavorite(true);
      } else {
        const updatedFavorites = favoriteTracks.filter(
          (track: TrackType) => track._id !== currentTrack._id
        );
        localStorage.setItem('favoriteTracks', JSON.stringify(updatedFavorites));
        setIsFavorite(false);
      }
      
      window.dispatchEvent(new Event('favoritesUpdated'));
      
      console.log(`Трек ${isFavorite ? 'удален из' : 'добавлен в'} избранные`);
      
    } catch (err) {
      console.error('Ошибка при обновлении избранных:', err);
    }
  };

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

  const handlePlayPause = () => {
    dispatch(togglePlay());
  };

  const handleNextTrack = () => {
    dispatch(nextTrack());
  };

  const handlePrevTrack = () => {
    dispatch(prevTrack());
  };

  const handleShuffle = () => {
    dispatch(setShuffle(!shuffle));
  };

  const handleLoop = () => {
    dispatch(setLoop(!loop));
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    dispatch(setVolume(newVolume));
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current || !duration) return;
    
    const rect = progressBarRef.current.getBoundingClientRect();
    const clickPosition = (e.clientX - rect.left) / rect.width;
    const newTime = clickPosition * duration;
    
    dispatch(seekToTime(newTime));
    
    const audioElement = document.querySelector('audio') as HTMLAudioElement;
    if (audioElement) {
      audioElement.currentTime = newTime;
    }
  };

  const handleProgressMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
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
  };

  const handleProgressDrag = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !progressBarRef.current || !duration) return;
    
    const rect = progressBarRef.current.getBoundingClientRect();
    const clickPosition = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const newTime = clickPosition * duration;
    
    dispatch(setCurrentTime(newTime));
  };

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;
  const volumePercentage = volume * 100;

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
                  cursor: 'pointer',
                  padding: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <svg 
                  width="14" 
                  height="12" 
                  viewBox="0 0 14 12"
                  fill="none"
                  stroke={isFavorite ? "#ad61ff" : "#696969"}
                  strokeWidth="2"
                  style={{
                    transition: 'all 0.2s ease'
                  }}
                >
                  <path d="M6.65242 1.89789C7.92929 0.420498 10.0241 0.282701 11.3595 1.70955C12.6948 3.1364 12.7837 5.46349 11.6265 6.99496L6.49976 12L1.37305 6.99496C0.215841 5.46349 0.304779 3.1364 1.64012 1.70955C2.97547 0.282701 5.07025 0.420498 6.34712 1.89789L6.49976 2.06847L6.65242 1.89789Z" />
                </svg>
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