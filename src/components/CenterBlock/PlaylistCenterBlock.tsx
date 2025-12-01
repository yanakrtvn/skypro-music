import Track from '@/components/Track/Track'
import styles from './CenterBlock.module.css'

export default function PlaylistCenterBlock() {
  const playlistTracks = [
    { 
      id: 1, 
      title: "Guilt", 
      artist: "Nero", 
      album: "Welcome Reality", 
      duration: "4:44" 
    },
    { 
      id: 2, 
      title: "Elektro", 
      artist: "Dynoro, Outwork, Mr. Gee", 
      album: "Elektro", 
      duration: "2:22" 
    }
  ]

  return (
    <div className={styles.centerblock}>
      <h2 className={styles.centerblock__h2}>Мой плейлист</h2>
      
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
          {playlistTracks.map(track => (
            <Track key={track.id} track={track} />
          ))}
        </div>
      </div>
    </div>
  )
}