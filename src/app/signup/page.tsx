'use client';

import { useState } from 'react';
import styles from './signup.module.css';
import classNames from 'classnames';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';

export default function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [errors, setErrors] = useState<string[]>([]);
  const { signup, isLoading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);
    
    const validationErrors: string[] = [];
    
    if (!email) validationErrors.push('Введите email');
    if (!password) validationErrors.push('Введите пароль');
    if (!confirmPassword) validationErrors.push('Подтвердите пароль');
    if (!username) validationErrors.push('Введите имя пользователя');
    
    if (password !== confirmPassword) {
      validationErrors.push('Пароли не совпадают');
    }
    
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      await signup(email, password, username);
    } catch (error) {
      setErrors([error instanceof Error ? error.message : 'Ошибка регистрации']);
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.containerEnter}>
        <div className={styles.modal__block}>
          <form className={styles.modal__form} onSubmit={handleSubmit}>
            <Link href="/">
              <div className={styles.modal__logo}>
                <Image
                  src="/images/logo_modal.png"
                  alt="Skypro Music"
                  width={140}
                  height={21}
                />
              </div>
            </Link>
            <input
              className={classNames(styles.modal__input, styles.login)}
              type="text"
              name="username"
              placeholder="Имя пользователя"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isLoading}
            />
            <input
              className={styles.modal__input}
              type="email"
              name="email"
              placeholder="Почта"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />
            <input
              className={styles.modal__input}
              type="password"
              name="password"
              placeholder="Пароль"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
            />
            <input
              className={styles.modal__input}
              type="password"
              name="confirmPassword"
              placeholder="Повторите пароль"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={isLoading}
            />
            <div className={styles.errorContainer}>
              {errors.map((error, index) => (
                <div key={index} className={styles.error}>
                  {error}
                </div>
              ))}
            </div>
            <button 
              className={styles.modal__btnSignupEnt} 
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? 'Загрузка...' : 'Зарегистрироваться'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}