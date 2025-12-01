import styles from './Sidebar.module.css'
import Link from 'next/link'
import Image from 'next/image'

export default function Sidebar() {
  return (
    <div className={styles.sidebar}>
      <div className={styles.sidebar__personal}>
        {/* <p className={styles.sidebar__personalName}>Sergey.Ivanov@gmail.com</p> */}
        <div className={styles.sidebar__icon}>
          <Image
            src="/images/icon/выход.svg"
            alt="Выход"
            width={20}
            height={20}
            className={styles.sidebar__iconImg}
          />
        </div>
      </div>
      <div className={styles.sidebar__block}>
        <div className={styles.sidebar__list}>
          <div className={styles.sidebar__item}>
            <Link className={styles.sidebar__link} href="/playlist/1">
              <Image
                className={styles.sidebar__img}
                src="/images/playlist01.png"
                alt="Плейлист дня"
                width={250}
                height={150}
              />
            </Link>
          </div>
          <div className={styles.sidebar__item}>
            <Link className={styles.sidebar__link} href="/playlist/2">
              <Image
                className={styles.sidebar__img}
                src="/images/playlist02.png"
                alt="100 танцевальных хитов"
                width={250}
                height={150}
              />
            </Link>
          </div>
          <div className={styles.sidebar__item}>
            <Link className={styles.sidebar__link} href="/playlist/3">
              <Image
                className={styles.sidebar__img}
                src="/images/playlist03.png"
                alt="Инди-заряд"
                width={250}
                height={150}
              />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}