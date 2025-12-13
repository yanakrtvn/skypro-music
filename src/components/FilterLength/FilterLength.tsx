'use client'

import styles from './FilterLength.module.css'

interface FilterLengthProps {
  count: number
}

export default function FilterLength({ count }: FilterLengthProps) {
  if (count === 0) return null
  
  return (
    <div className={styles.filter__length}>
      {count}
    </div>
  )
}