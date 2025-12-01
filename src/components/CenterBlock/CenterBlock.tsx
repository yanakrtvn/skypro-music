import Track from '@/components/Track/Track'
import styles from './CenterBlock.module.css'

export default function CenterBlock() {
  const tracks = [
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
    },
    { 
      id: 3, 
      title: "I'm Fire", 
      artist: "Ali Bakgor", 
      album: "I'm Fire", 
      duration: "2:22" 
    },
    { 
      id: 4, 
      title: "Non Stop", 
      artist: "Стоункат, Psychopath", 
      album: "Non Stop", 
      duration: "4:12",
      subtitle: "(Remix)"
    },
    { 
      id: 5, 
      title: "Run Run", 
      artist: "Jaded, Will Clarke, AR/CO", 
      album: "Run Run", 
      duration: "2:54",
      subtitle: "(feat. AR/CO)"
    },
    { 
      id: 6, 
      title: "Eyes on Fire", 
      artist: "Blue Foundation, Zeds Dead", 
      album: "Eyes on Fire", 
      duration: "5:20",
      subtitle: "(Zeds Dead Remix)"
    },
    { 
      id: 7, 
      title: "Mucho Bien", 
      artist: "HYBIT, Mr. Black, Offer Nissim, Hi Profile", 
      album: "Mucho Bien", 
      duration: "3:41",
      subtitle: "(Hi Profile Remix)"
    },
    { 
      id: 8, 
      title: "Knives n Cherries", 
      artist: "minthaze", 
      album: "Captivating", 
      duration: "1:48" 
    },
    { 
      id: 9, 
      title: "How Deep Is Your Love", 
      artist: "Calvin Harris, Disciples", 
      album: "How Deep Is Your Love", 
      duration: "3:32" 
    },
    { 
      id: 10, 
      title: "Morena", 
      artist: "Tom Boxer", 
      album: "Soundz Made in Romania", 
      duration: "3:36" 
    }
  ]

  return (
    <div className={styles.centerblock}>
      <div className={styles.centerblock__search}>
        <svg className={styles.search__svg}>
          <use xlinkHref="/images/icon/sprite.svg#icon-search"></use>
        </svg>
        <input
          className={styles.search__text}
          type="search"
          placeholder="Поиск"
          name="search"
        />
      </div>
      
      <h2 className={styles.centerblock__h2}>Треки</h2>
      
      <div className={styles.centerblock__filter}>
        <div className={styles.filter__title}>Искать по:</div>
        <div className={styles.filter__button}>исполнителю</div>
        <div className={styles.filter__button}>году выпуска</div>
        <div className={styles.filter__button}>жанру</div>
      </div>
      
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
          {tracks.map(track => (
            <Track key={track.id} track={track} />
          ))}
        </div>
      </div>
    </div>
  )
}