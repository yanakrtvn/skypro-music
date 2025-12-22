'use client';

import { useState, useEffect, useRef } from 'react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { togglePlay } from '@/store/features/trackSlice';
import styles from './Bar.module.css';

function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

export default function Bar() {
  const { currentTrack, isPlaying } = useAppSelector((state) => state.tracks);
  const dispatch = useAppDispatch();
  const [volume, setVolume] = useState(0.5);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audioElement = document.querySelector('audio');
    if (audioElement) {
      audioRef.current = audioElement as HTMLAudioElement;
      audioElement.volume = volume;
    }
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const handlePlayPause = () => {
    dispatch(togglePlay());
  };

  const handleNextTrack = () => {
    alert('Еще не реализовано');
  };

  const handlePrevTrack = () => {
    alert('Еще не реализовано');
  };

  const handleShuffle = () => {
    alert('Еще не реализовано');
  };

  const handleLoop = () => {
    alert('Еще не реализовано');
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
  };

  if (!currentTrack) {
    return null;
  }

  return (
    <div className={styles.bar}>
      <div className={styles.bar__content}>
        <div className={styles.bar__playerProgress}></div>
        <div className={styles.bar__playerBlock}>
          <div className={styles.bar__player}>
            <div className={styles.player__controls}>
              <div 
                className={styles.player__btnPrev} 
                onClick={handlePrevTrack}
                style={{ cursor: 'pointer' }}
              >
                <svg className={styles.player__btnPrevSvg}>
                  <use xlinkHref="/images/icon/sprite.svg#icon-prev"></use>
                </svg>
              </div>
              
              <div 
                className={styles.player__btnPlay} 
                onClick={handlePlayPause}
                style={{ cursor: 'pointer' }}
              >
                <svg className={styles.player__btnPlaySvg}>
                  <use xlinkHref={`/images/icon/sprite.svg#${isPlaying ? 'icon-pause' : 'icon-play'}`}></use>
                </svg>
              </div>
              
              <div 
                className={styles.player__btnNext} 
                onClick={handleNextTrack}
                style={{ cursor: 'pointer' }}
              >
                <svg className={styles.player__btnNextSvg}>
                  <use xlinkHref="/images/icon/sprite.svg#icon-next"></use>
                </svg>
              </div>
              
              <div 
                className={styles.player__btnRepeat} 
                onClick={handleLoop}
                style={{ cursor: 'pointer' }}
              >
                <svg className={styles.player__btnRepeatSvg}>
                  <use xlinkHref="/images/icon/sprite.svg#icon-repeat"></use>
                </svg>
              </div>
              
              <div 
                className={styles.player__btnShuffle} 
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
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}