import Header from '@/components/Header/Header'
import CenterBlock from '@/components/CenterBlock/CenterBlock'
import Sidebar from '@/components/Sidebar/Sidebar'
import Bar from '@/components/Bar/Bar'
import styles from '../page.module.css'

export default function Category() {
  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <main className={styles.main}>
          <Header />
          <CenterBlock />
          <Sidebar />
        </main>
        <Bar />
      </div>
    </div>
  )
}