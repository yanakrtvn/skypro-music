'use client';
import { useState, useEffect, useMemo } from 'react'
import Track from '@/components/Track/Track'
import styles from './CenterBlock.module.css'
import FilterList from '@/components/FilterList/FilterList'
import FilterLength from '@/components/FilterLength/FilterLength'
import { useAppSelector, useAppDispatch } from '@/store/hooks'
import { setPlaylistTracks } from '@/store/features/trackSlice'
import { ApiClient } from '@/api/client'
import { Track as TrackType } from '@/types/api'


interface FilterState {
  artist: string | null;
  year: string | null;
  genre: string | null;
}
function getUniqueValuesFromTracks<T extends object>(arr: T[], key: keyof T): string[] {
  if (!Array.isArray(arr)) {
    console.error('getUniqueValuesFromTracks: arr не массив', arr);
    return [];
  }
  
  const uniqueValues = new Set<string>();
  
  arr.forEach((item) => {
    if (!item || typeof item !== 'object') return;
    
    const value = item[key] as unknown;
    
    if (Array.isArray(value)) {
      (value as string[]).forEach((v) => {
        if (v && typeof v === 'string') uniqueValues.add(v);
      });
    } else if (typeof value === 'string') {
      uniqueValues.add(value);
    } else if (typeof value === 'number') {
      uniqueValues.add(value.toString());
    }
  });
  
  return Array.from(uniqueValues).sort();
}

export default function CenterBlock() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState<string | null>(null)
  const [selectedFilters, setSelectedFilters] = useState<FilterState>({
    artist: null,
    year: null,
    genre: null
  })
  const [tracks, setTracks] = useState<TrackType[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const dispatch = useAppDispatch()

  useEffect(() => {
    const loadTracks = async () => {
      try {
        setLoading(true);
        const tracksData = await ApiClient.getAllTracks();
        setTracks(tracksData);
        dispatch(setPlaylistTracks(tracksData));
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ошибка загрузки треков');
        setTracks([]);
        dispatch(setPlaylistTracks([]));
      } finally {
        setLoading(false);
      }
    };
    
    loadTracks();
  }, [dispatch]);
  
  const uniqueArtists = useMemo(() => 
    getUniqueValuesFromTracks(tracks, 'author'), 
    [tracks]
  );
  
  const uniqueGenres = useMemo(() => 
    [...new Set(tracks.flatMap(track => track.genre))].sort(), 
    [tracks]
  );
  
  const uniqueYears = useMemo(() => 
    [...new Set(tracks.map(track => track.release_date.split('-')[0]))]
      .sort((a, b) => b.localeCompare(a)), 
    [tracks]
  );
  
  const toggleFilter = (filterName: string) => {
    if (activeFilter === filterName) {
      setActiveFilter(null);
    } else {
      setActiveFilter(filterName);
    }
  };
  
  const handleFilterSelect = (filterName: string, value: string) => {
    setSelectedFilters(prev => {
      const newValue = prev[filterName as keyof FilterState] === value ? null : value;
      return {
        ...prev,
        [filterName]: newValue
      };
    });
    setActiveFilter(null); 
  };
  
  const getFilterItems = () => {
    switch(activeFilter) {
      case 'artist':
        return uniqueArtists;
      case 'year':
        return uniqueYears;
      case 'genre':
        return uniqueGenres;
      default:
        return [];
    }
  };
  
  const getFilterCount = () => {
    switch(activeFilter) {
      case 'artist':
        return uniqueArtists.length;
      case 'year':
        return uniqueYears.length;
      case 'genre':
        return uniqueGenres.length;
      default:
        return 0;
    }
  };
  
  // Фильтрация треков
  const filteredTracks = useMemo(() => {
    return tracks.filter(track => {
      // Поиск по тексту
      const matchesSearch = searchQuery === '' || 
        track.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        track.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
        track.album.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Фильтр по исполнителю
      const matchesArtist = !selectedFilters.artist || 
        track.author === selectedFilters.artist;
      
      // Фильтр по году
      const matchesYear = !selectedFilters.year || 
        track.release_date.startsWith(selectedFilters.year);
      
      // Фильтр по жанру
      const matchesGenre = !selectedFilters.genre || 
        track.genre.includes(selectedFilters.genre);
      
      return matchesSearch && matchesArtist && matchesYear && matchesGenre;
    });
  }, [tracks, searchQuery, selectedFilters]);
  
  if (loading) {
    return (
      <div className={styles.centerblock}>
        <div className={styles.loading}>Загрузка треков...</div>
      </div>
    )
  }
  
  if (error) {
    return (
      <div className={styles.centerblock}>
        <div className={styles.error}>Ошибка: {error}</div>
      </div>
    )
  }
  
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
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      
      <h2 className={styles.centerblock__h2}>Треки</h2>
      
      {/* Панель фильтров */}
      <div className={styles.centerblock__filter}>
        <div className={styles.filter__title}>Искать по:</div>
        
        <div className={styles.filter__container}>
          <button 
            className={`${styles.filter__button} ${
              activeFilter === 'artist' || selectedFilters.artist ? styles.filter__buttonActive : ''
            }`}
            onClick={() => toggleFilter('artist')}
          >
            исполнителю
            {selectedFilters.artist && (
              <span className={styles.filter__selected}>: {selectedFilters.artist}</span>
            )}
          </button>
          {activeFilter === 'artist' && (
            <>
              <FilterList 
                items={getFilterItems()} 
                onItemClick={(item) => handleFilterSelect('artist', item)}
              />
              <FilterLength count={getFilterCount()} />
            </>
          )}
        </div>
        
        <div className={styles.filter__container}>
          <button 
            className={`${styles.filter__button} ${
              activeFilter === 'year' || selectedFilters.year ? styles.filter__buttonActive : ''
            }`}
            onClick={() => toggleFilter('year')}
          >
            году выпуска
            {selectedFilters.year && (
              <span className={styles.filter__selected}>: {selectedFilters.year}</span>
            )}
          </button>
          {activeFilter === 'year' && (
            <>
              <FilterList 
                items={getFilterItems()} 
                onItemClick={(item) => handleFilterSelect('year', item)}
              />
              <FilterLength count={getFilterCount()} />
            </>
          )}
        </div>
        
        <div className={styles.filter__container}>
          <button 
            className={`${styles.filter__button} ${
              activeFilter === 'genre' || selectedFilters.genre ? styles.filter__buttonActive : ''
            }`}
            onClick={() => toggleFilter('genre')}
          >
            жанру
            {selectedFilters.genre && (
              <span className={styles.filter__selected}>: {selectedFilters.genre}</span>
            )}
          </button>
          {activeFilter === 'genre' && (
            <>
              <FilterList 
                items={getFilterItems()} 
                onItemClick={(item) => handleFilterSelect('genre', item)}
              />
              <FilterLength count={getFilterCount()} />
            </>
          )}
        </div>
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
          {filteredTracks.length > 0 ? (
            filteredTracks.map(track => (
              <Track key={track._id} track={track} />
            ))
          ) : (
            <div className={styles.noResults}>
              {searchQuery || selectedFilters.artist || selectedFilters.year || selectedFilters.genre ? 
                'По вашему запросу ничего не найдено' : 
                'Треков пока нет'}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}