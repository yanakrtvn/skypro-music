import Link from 'next/link'
import styles from './Bar.module.css'

export default function Bar() {
  return (
    <div className={styles.bar}>
      <div className={styles.bar__content}>
        <div className={styles.bar__playerProgress}></div>
        <div className={styles.bar__playerBlock}>
          <div className={styles.bar__player}>
            <div className={styles.player__controls}>
              <div className={styles.player__btnPrev}>
                <svg className={styles.player__btnPrevSvg}>
                  <use xlinkHref="/images/icon/sprite.svg#icon-prev"></use>
                </svg>
              </div>
              <div className={styles.player__btnPlay}>
                <svg className={styles.player__btnPlaySvg}>
                  <use xlinkHref="/images/icon/sprite.svg#icon-play"></use>
                </svg>
              </div>
              <div className={styles.player__btnNext}>
                <svg className={styles.player__btnNextSvg}>
                  <use xlinkHref="/images/icon/sprite.svg#icon-next"></use>
                </svg>
              </div>
              <div className={styles.player__btnRepeat}>
                <svg className={styles.player__btnRepeatSvg}>
                  <use xlinkHref="/images/icon/sprite.svg#icon-repeat"></use>
                </svg>
              </div>
              <div className={styles.player__btnShuffle}>
                <svg className={styles.player__btnShuffleSvg}>
                  <use xlinkHref="/images/icon/sprite.svg#icon-shuffle"></use>
                </svg>
              </div>
            </div>

            <div className={styles.player__trackPlay}>
              <div className={styles.trackPlay__contain}>
                <div className={styles.trackPlay__image}>
                  <svg className={styles.trackPlay__svg}>
                    <use xlinkHref="/images/icon/sprite.svg#icon-note"></use>
                  </svg>
                </div>
                <div className={styles.trackPlay__author}>
                  <Link className={styles.trackPlay__authorLink} href="/">
                    Трек
                  </Link>
                </div>
                <div className={styles.trackPlay__album}>
                  <Link className={styles.trackPlay__albumLink} href="/">
                    Альбом
                  </Link>
                </div>
              </div>

              <div className={styles.trackPlay__likeDislike}>
                <div className={styles.trackPlay__like}>
                  <svg className={styles.trackPlay__likeSvg}>
                    <use xlinkHref="/images/icon/sprite.svg#icon-like"></use>
                  </svg>
                </div>
                <div className={styles.trackPlay__dislike}>
                  <svg className={styles.trackPlay__dislikeSvg}>
                    <use xlinkHref="/images/icon/sprite.svg#icon-dislike"></use>
                  </svg>
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
                  name="range"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}