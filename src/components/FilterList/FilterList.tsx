'use client'

import styles from './FilterList.module.css'

interface FilterListProps {
  items: string[]
  selectedItems?: string[]
  onItemClick?: (item: string) => void
  onClear?: () => void
}

export default function FilterList({ items, selectedItems = [], onItemClick, onClear }: FilterListProps) {
  const handleClick = (item: string) => {
    if (onItemClick) {
      onItemClick(item);
    }
  };

  const isSelected = (item: string) => {
    return selectedItems.includes(item);
  };

  return (
    <div className={styles.filter__content}>
      <div className={styles.filter__list}>
        {items.map((item) => (
          <div 
            key={item} 
            className={`${styles.filter__item} ${isSelected(item) ? styles.filter__itemSelected : ''}`}
            onClick={() => handleClick(item)}
          >
            <div className={styles.filter__itemText}>{item}</div>
          </div>
        ))}
        {selectedItems.length > 0 && onClear && (
          <div 
            className={styles.filter__clear}
            onClick={onClear}
          >
            Сбросить
          </div>
        )}
      </div>
    </div>
  )
}