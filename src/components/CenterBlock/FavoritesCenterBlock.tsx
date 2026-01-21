'use client';

import { useState, useMemo, useCallback } from 'react';
import Track from '@/components/Track/Track';
import styles from './CenterBlock.module.css';
import { useAppSelector } from '@/store/hooks';
import { Track as TrackType } from '@/types/api';
import FilterList from '@/components/FilterList/FilterList';
import FilterLength from '@/components/FilterLength/FilterLength';

interface FavoritesCenterBlockProps {
  serverFavorites?: TrackType[];
}

type FilterState = {
  artist: string[];
  year: string[];
  genre: string[];
};

function getUniqueValuesFromTracks<T extends object>(arr: T[], key: keyof T): string[] {
  if (!Array.isArray(arr)) return [];
  
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

export default function FavoritesCenterBlock({ serverFavorites = [] }: FavoritesCenterBlockProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [selectedFilters, setSelectedFilters] = useState<FilterState>({
    artist: [],
    year: [],
    genre: []
  });
  
  const { favoriteTracks } = useAppSelector((state) => state.tracks);

  const displayTracks = useMemo(() => 
    serverFavorites.length > 0 ? serverFavorites : favoriteTracks,
    [serverFavorites, favoriteTracks]
  );

  const uniqueArtists = useMemo(() => 
    getUniqueValuesFromTracks(displayTracks, 'author'), 
    [displayTracks]
  );
  
  const uniqueGenres = useMemo(() => {
    if (!Array.isArray(displayTracks) || displayTracks.length === 0) return [];
    
    const genresSet = new Set<string>();
    
    displayTracks.forEach(track => {
      if (track.genre && Array.isArray(track.genre)) {
        track.genre.forEach(genre => {
          if (genre && typeof genre === 'string') {
            genresSet.add(genre);
          }
        });
      }
    });
    
    return Array.from(genresSet).sort();
  }, [displayTracks]);
  
  const uniqueYears = useMemo(() => {
    if (!Array.isArray(displayTracks) || displayTracks.length === 0) return [];
    
    const yearsSet = new Set<string>();
    
    displayTracks.forEach(track => {
      if (track.release_date && typeof track.release_date === 'string') {
        const year = track.release_date.split('-')[0];
        if (year && year.length === 4 && !isNaN(Number(year))) {
          yearsSet.add(year);
        }
      }
    });

    return Array.from(yearsSet).sort((a, b) => {
      const yearA = parseInt(a, 10);
      const yearB = parseInt(b, 10);
      return yearB - yearA;
    });
  }, [displayTracks]);
  
  const toggleFilter = useCallback((filterName: string) => {
    setActiveFilter(prev => prev === filterName ? null : filterName);
  }, []);
  
  const handleFilterSelect = useCallback((filterName: string, value: string) => {
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
  }, []);
  
  const clearFilter = useCallback((filterName: string) => {
    setSelectedFilters(prev => ({
      ...prev,
      [filterName]: []
    }));

    setActiveFilter(prev => prev === filterName ? null : prev);
  }, []);
  
  const getFilterItems = useCallback(() => {
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
  }, [activeFilter, uniqueArtists, uniqueYears, uniqueGenres]);
  
  const getFilterCount = useCallback(() => {
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
  }, [activeFilter, uniqueArtists.length, uniqueYears.length, uniqueGenres.length]);

  const getFilterDisplayText = useCallback((filterName: string) => {
    const selected = selectedFilters[filterName as keyof FilterState];
    if (selected.length === 0) {
      return '';
    } else if (selected.length === 1) {
      return `: ${selected[0]}`;
    } else {
      return `: ${selected.length}`;
    }
  }, [selectedFilters]);
  
  const filteredTracks = useMemo(() => {
    if (!Array.isArray(displayTracks)) return [];
    
    return displayTracks.filter(track => {
      if (!track) return false;

      const matchesSearch = searchQuery === '' || 
        (track.name && track.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (track.author && track.author.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (track.album && track.album.toLowerCase().includes(searchQuery.toLowerCase()));
      
      if (!matchesSearch) return false;
      
      const matchesArtist = selectedFilters.artist.length === 0 || 
        (track.author && selectedFilters.artist.includes(track.author));
      
      if (!matchesArtist) return false;
      
      if (selectedFilters.year.length > 0) {
        if (!track.release_date) return false;
        
        const trackYear = track.release_date.split('-')[0];
        const matchesYear = trackYear && selectedFilters.year.includes(trackYear);
        
        if (!matchesYear) return false;
      }
      
      if (selectedFilters.genre.length > 0) {
        if (!track.genre || !Array.isArray(track.genre)) return false;
        
        const matchesGenre = track.genre.some(genre => 
          genre && selectedFilters.genre.includes(genre)
        );
        
        if (!matchesGenre) return false;
      }
      
      return true;
    });
  }, [displayTracks, searchQuery, selectedFilters]);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  }, []);

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
          onChange={handleSearchChange}
        />
      </div>
      
      <h2 className={styles.centerblock__h2}>Мои треки</h2>
      
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
            filteredTracks
              .filter((track) => track && track._id !== undefined)
              .map((track, index) => (
                <Track 
                  key={`favorites-${track._id}-${index}-${track.name}`}
                  track={track} 
                  isInFavoritesPage={true}
                />
              ))
          ) : (
            <div className={styles.emptyPlaylist}>
              {searchQuery || selectedFilters.artist.length > 0 || 
               selectedFilters.year.length > 0 || selectedFilters.genre.length > 0
                ? 'По вашему запросу ничего не найдено'
                : 'Здесь пока нет треков. Добавьте их, нажав на сердечко!'
              }
            </div>
          )}
        </div>
      </div>
    </div>
  );
}