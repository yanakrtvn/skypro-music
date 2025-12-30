'use client'
import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import styles from './Header.module.css'
import { useAuth } from '@/context/AuthContext'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { user, logout } = useAuth()

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const closeMenu = () => {
    setIsMenuOpen(false)
  }

  const handleLogout = () => {
    logout()
    closeMenu()
  }

  return (
    <div className={`${styles.nav} ${isMenuOpen ? styles.navMenuOpen : ''}`}>
      <div className={styles.nav__content}>
        <div className={styles.nav__logo}>
          <Link href="/" onClick={closeMenu}>
            <Image
              width={113}
              height={17}
              className={styles.logo__image}
              src="/images/logo.png"
              alt="Skypro Music Logo"
            />
          </Link>
        </div>
        
        <div 
          className={styles.nav__burger} 
          onClick={toggleMenu}
        >
          <span className={styles.burger__line}></span>
          <span className={styles.burger__line}></span>
          <span className={styles.burger__line}></span>
        </div>
      </div>
      
      <div className={`${styles.nav__menu} ${isMenuOpen ? styles.nav__menuVisible : ''}`}>
        <ul className={styles.menu__list}>
          <li className={styles.menu__item}>
            <Link href="/" className={styles.menu__link} onClick={closeMenu}>
              Главное
            </Link>
          </li>
          <li className={styles.menu__item}>
            <Link href="/favorites" className={styles.menu__link} onClick={closeMenu}>
              Мои треки
            </Link>
          </li>
          {user ? (
            <>
              <li className={styles.menu__item}>
                <button 
                  className={styles.menu__link} 
                  onClick={handleLogout}
                  style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  Выйти
                </button>
              </li>
            </>
          ) : (
            <li className={styles.menu__item}>
              <Link href="/signin" className={styles.menu__link} onClick={closeMenu}>
                Войти
              </Link>
            </li>
          )}
        </ul>
      </div>
    </div>
  )
}