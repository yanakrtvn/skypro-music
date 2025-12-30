import { ReactNode } from 'react';
import Header from '@/components/Header/Header';
import Sidebar from '@/components/Sidebar/Sidebar';
import Bar from '@/components/Bar/Bar';
import styles from './Layout.module.css';

interface LayoutProps {
  children: ReactNode;
  isLoading?: boolean;
  error?: string | null;
}

export default function Layout({ children, isLoading, error }: LayoutProps) {
  if (isLoading) {
    return (
      <div className={styles.wrapper}>
        <div className={styles.container}>
          <div className={styles.loading}>Загрузка...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.wrapper}>
        <div className={styles.container}>
          <div className={styles.error}>{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <main className={styles.main}>
          <Header />
          {children}
          <Sidebar />
        </main>
        <Bar />
      </div>
    </div>
  );
}