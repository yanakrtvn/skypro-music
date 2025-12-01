import Link from 'next/link'
import styles from './Track.module.css'

interface TrackProps {
  track: {
    id: number
    title: string
    artist: string
    album: string
    duration: string
    subtitle?: string
  }
}

export default function Track({ track }: TrackProps) {
  return (
    <div className={styles.playlist__item}>
      <div className={styles.playlist__track}>
        <div className={styles.track__title}>
          <div className={styles.track__titleImage}>
            <svg className={styles.track__titleSvg}>
              <use xlinkHref="/images/icon/sprite.svg#icon-note"></use>
            </svg>
          </div>
          <div className={styles.track__titleText}>
            <Link className={styles.track__titleLink} href="">
              {track.title} 
              {track.subtitle && (
                <span className={styles.track__titleSpan}> {track.subtitle}</span>
              )}
            </Link>
          </div>
        </div>
        
        <div className={styles.track__author}>
          <Link className={styles.track__authorLink} href="">
            {track.artist}
          </Link>
        </div>
        
        <div className={styles.track__album}>
          <Link className={styles.track__albumLink} href="">
            {track.album}
          </Link>
        </div>
        
        <div className={styles.track__time}>
          <svg className={styles.track__timeSvg}>
            <use xlinkHref="/images/icon/sprite.svg#icon-like"></use>
          </svg>
          <span className={styles.track__timeText}>{track.duration}</span>
        </div>
      </div>
    </div>
  )
}