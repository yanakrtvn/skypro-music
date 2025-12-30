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
  artist: string[];
  year: string[];
  genre: string[];
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
    artist: [],
    year: [],
    genre: []
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
      const currentValues = prev[filterName as keyof FilterState];
      const valueIndex = currentValues.indexOf(value);
      
      if (valueIndex === -1) {
        return {
          ...prev,
          [filterName]: [...currentValues, value]
        };
      } else {
        return {
          ...prev,
          [filterName]: currentValues.filter((_, index) => index !== valueIndex)
        };
      }
    });
  };
  
  const clearFilter = (filterName: string) => {
    setSelectedFilters(prev => ({
      ...prev,
      [filterName]: []
    }));

    if (activeFilter === filterName) {
      setActiveFilter(null);
    }
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

  const getFilterDisplayText = (filterName: string) => {
    const selected = selectedFilters[filterName as keyof FilterState];
    if (selected.length === 0) {
      return '';
    } else if (selected.length === 1) {
      return `: ${selected[0]}`;
    } else {
      return `: ${selected.length}`;
    }
  };
  
  const filteredTracks = useMemo(() => {
    return tracks.filter(track => {

      const matchesSearch = searchQuery === '' || 
        track.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        track.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
        track.album.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Фильтр по исполнителю
      const matchesArtist = selectedFilters.artist.length === 0 || 
        selectedFilters.artist.includes(track.author);
      
      // Фильтр по году
      const trackYear = track.release_date.split('-')[0];
      const matchesYear = selectedFilters.year.length === 0 || 
        selectedFilters.year.includes(trackYear);
      
      // Фильтр по жанру 
      const matchesGenre = selectedFilters.genre.length === 0 || 
        track.genre.some(genre => selectedFilters.genre.includes(genre));
      
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
            selectedFilters.artist.length > 0 ? styles.filter__buttonActive : ''
          }`}
          onClick={() => toggleFilter('artist')}
        >
          исполнителю
          {selectedFilters.artist.length > 0 && (
            <span className={styles.filter__selected}>
              {getFilterDisplayText('artist')}
            </span>
          )}
        </button>
        {activeFilter === 'artist' && (
          <>
            <FilterList 
              items={getFilterItems()} 
              selectedItems={selectedFilters.artist}
              onItemClick={(item) => handleFilterSelect('artist', item)}
              onClear={() => clearFilter('artist')}
            />
            <FilterLength count={getFilterCount()} />
          </>
        )}
      </div>
      
      <div className={styles.filter__container}>
        <button 
          className={`${styles.filter__button} ${
            selectedFilters.year.length > 0 ? styles.filter__buttonActive : ''
          }`}
          onClick={() => toggleFilter('year')}
        >
          году выпуска
          {selectedFilters.year.length > 0 && (
            <span className={styles.filter__selected}>
              {getFilterDisplayText('year')}
            </span>
          )}
        </button>
        {activeFilter === 'year' && (
          <>
            <FilterList 
              items={getFilterItems()} 
              selectedItems={selectedFilters.year}
              onItemClick={(item) => handleFilterSelect('year', item)}
              onClear={() => clearFilter('year')}
            />
            <FilterLength count={getFilterCount()} />
          </>
        )}
      </div>
      
      <div className={styles.filter__container}>
        <button 
          className={`${styles.filter__button} ${
            selectedFilters.genre.length > 0 ? styles.filter__buttonActive : ''
          }`}
          onClick={() => toggleFilter('genre')}
        >
          жанру
          {selectedFilters.genre.length > 0 && (
            <span className={styles.filter__selected}>
              {getFilterDisplayText('genre')}
            </span>
          )}
        </button>
        {activeFilter === 'genre' && (
          <>
            <FilterList 
              items={getFilterItems()} 
              selectedItems={selectedFilters.genre}
              onItemClick={(item) => handleFilterSelect('genre', item)}
              onClear={() => clearFilter('genre')}
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
            {searchQuery || selectedFilters.artist.length > 0 || selectedFilters.year.length > 0 || selectedFilters.genre.length > 0 ? 
              'По вашему запросу ничего не найдено' : 
              'Треков пока нет'}
          </div>
        )}
      </div>
    </div>
  </div>
)
}