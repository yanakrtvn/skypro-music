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
  const progressBarRef = useRef<HTMLDivElement>(null);

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
                  {currentTrack.logo ? (
                    <img src={currentTrack.logo} alt={currentTrack.name} />
                  ) : (
                    <svg className={styles.trackPlay__svg}>
                      <use xlinkHref="/images/icon/sprite.svg#icon-note"></use>
                    </svg>
                  )}
                </div>
                <div className={styles.trackPlay__author}>
                  <span className={styles.trackPlay__authorLink}>{currentTrack.name}</span>
                </div>
                <div className={styles.trackPlay__album}>
                  <span className={styles.trackPlay__albumLink}>{currentTrack.author}</span>
                </div>
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