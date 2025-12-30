'use client'

import styles from './FilterList.module.css'

interface FilterListProps {
  items: string[]
  onItemClick?: (item: string) => void
}

export default function FilterList({ items, onItemClick }: FilterListProps) {
  const handleClick = (item: string) => {
    if (onItemClick) {
      onItemClick(item);
    }
  };

  return (
    <div className={styles.filter__content}>
      <div className={styles.filter__list}>
        {items.map((item) => (
          <div 
            key={item} 
            className={styles.filter__item}
            onClick={() => handleClick(item)}
          >
            <div className={styles.filter__itemText}>{item}</div>
          </div>
        ))}
      </div>
    </div>
  )
}