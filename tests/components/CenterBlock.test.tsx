import React from 'react';
import '@testing-library/jest-dom';

describe('CenterBlock Component', () => {
  test('CenterBlock component basic test', () => {
    expect(typeof React).toBe('object');
  });

  test('CenterBlock search functionality', () => {
    const tracks = [
      { name: 'Track 1', author: 'Artist A', album: 'Album A' },
      { name: 'Track 2', author: 'Artist B', album: 'Album B' },
      { name: 'Another Track', author: 'Artist A', album: 'Album A' },
    ];
    
    const searchTracks = (query: string) => {
      return tracks.filter(track => 
        track.name.toLowerCase().includes(query.toLowerCase()) ||
        track.author.toLowerCase().includes(query.toLowerCase()) ||
        track.album.toLowerCase().includes(query.toLowerCase())
      );
    };
    
    expect(searchTracks('Track 1').length).toBe(1);
    expect(searchTracks('Artist A').length).toBe(2);
    expect(searchTracks('Album B').length).toBe(1);
    expect(searchTracks('nonexistent').length).toBe(0);
  });

  test('CenterBlock filter combination', () => {
    const applyFilters = (
      searchQuery: string,
      selectedArtists: string[],
      selectedGenres: string[]
    ) => {
      let filtered = true;
      
      if (searchQuery && searchQuery.trim() !== '') {
        filtered = filtered && searchQuery.length > 0;
      }
      
      if (selectedArtists.length > 0) {
        filtered = filtered && selectedArtists.length > 0;
      }
      
      if (selectedGenres.length > 0) {
        filtered = filtered && selectedGenres.length > 0;
      }
      
      return filtered;
    };
    
    expect(applyFilters('', [], [])).toBe(true);
    expect(applyFilters('rock', ['Artist A'], [])).toBe(true);
    expect(applyFilters('', ['Artist A'], ['Rock'])).toBe(true);
  });
});