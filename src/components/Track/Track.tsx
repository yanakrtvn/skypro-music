'use client';

import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { setCurrentTrack, playTrack } from '@/store/features/trackSlice';
import { TrackType } from '@/types/track';
import styles from './Track.module.css';

function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

export default function Track({ track }: TrackProps) {
  const { currentTrack, isPlaying } = useAppSelector((state) => state.tracks);
  const dispatch = useAppDispatch();

  const isCurrentTrack = currentTrack?._id === track._id;

  const handleTrackClick = () => {
    if (!isCurrentTrack) {
      dispatch(setCurrentTrack(track));
      dispatch(playTrack());
    } else {
      dispatch(playTrack());
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
              <svg className={styles.track__titleSvg}>
                <use xlinkHref="/images/icon/sprite.svg#icon-note"></use>
              </svg>
            )}
          </div>
          <div className={styles.track__titleText}>
            <div className={styles.track__titleLink}>
              {track.name}
              {!track.track_file && (
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
          <svg className={styles.track__timeSvg}>
            <use xlinkHref="/images/icon/sprite.svg#icon-like"></use>
          </svg>
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