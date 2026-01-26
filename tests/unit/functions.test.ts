import { formatTime, getUniqueValuesFromTracks } from '../../src/utils/helpers';

type TestTrack = {
  author?: string | null;
  genre?: string[];
  duration_in_seconds?: number;
  [key: string]: unknown;
};

describe('Pure Functions Tests', () => {
  describe('formatTime function', () => {
    test('форматирует 0 секунд', () => {
      expect(formatTime(0)).toBe('0:00');
    });

    test('форматирует 30 секунд', () => {
      expect(formatTime(30)).toBe('0:30');
    });

    test('форматирует 65 секунд', () => {
      expect(formatTime(65)).toBe('1:05');
    });

    test('форматирует 125 секунд', () => {
      expect(formatTime(125)).toBe('2:05');
    });

    test('форматирует 3600 секунд (1 час)', () => {
      expect(formatTime(3600)).toBe('60:00');
    });

    test('обрабатывает NaN', () => {
      expect(formatTime(NaN)).toBe('0:00');
    });

    test('форматирует дробные секунды', () => {
      expect(formatTime(65.7)).toBe('1:05');
    });

    test('форматирует отрицательные значения', () => {
      expect(formatTime(-30)).toBe('-1:-30');
    });
  });

  describe('getUniqueValuesFromTracks function', () => {
    test('возвращает уникальных исполнителей', () => {
      const tracks: TestTrack[] = [
        { author: 'Artist A' },
        { author: 'Artist B' },
        { author: 'Artist A' },
      ];
      
      expect(getUniqueValuesFromTracks(tracks, 'author')).toEqual(['Artist A', 'Artist B']);
    });

    test('возвращает уникальные жанры', () => {
      const tracks: TestTrack[] = [
        { genre: ['Rock', 'Pop'] },
        { genre: ['Pop', 'Jazz'] },
        { genre: ['Rock'] },
      ];
      
      expect(getUniqueValuesFromTracks(tracks, 'genre')).toEqual(['Jazz', 'Pop', 'Rock']);
    });

    test('обрабатывает пустой массив', () => {
      const tracks: TestTrack[] = [];
      expect(getUniqueValuesFromTracks(tracks, 'author')).toEqual([]);
    });

    test('обрабатывает массив с null/undefined элементами', () => {
      const tracks: TestTrack[] = [
        { author: 'Artist A' },
        { author: null },
        { author: undefined },
      ];
      
      expect(getUniqueValuesFromTracks(tracks, 'author')).toEqual(['Artist A']);
    });

    test('обрабатывает числовые значения', () => {
      const tracks: TestTrack[] = [
        { duration_in_seconds: 120 },
        { duration_in_seconds: 180 },
        { duration_in_seconds: 120 },
      ];
      
      expect(getUniqueValuesFromTracks(tracks, 'duration_in_seconds')).toEqual(['120', '180']);
    });

    test('возвращает отсортированный список', () => {
      const tracks: TestTrack[] = [
        { author: 'Zebra' },
        { author: 'Apple' },
        { author: 'Monkey' },
      ];
      
      expect(getUniqueValuesFromTracks(tracks, 'author')).toEqual(['Apple', 'Monkey', 'Zebra']);
    });

    test('игнорирует пустые строки', () => {
      const tracks: TestTrack[] = [
        { author: 'Artist A' },
        { author: '' },
        { author: 'Artist B' },
      ];
      
      expect(getUniqueValuesFromTracks(tracks, 'author')).toEqual(['Artist A', 'Artist B']);
    });

    test('обрабатывает несуществующее свойство', () => {
      const tracks: TestTrack[] = [
        { author: 'Artist A' },
        { author: 'Artist B' },
      ];
      
      expect(getUniqueValuesFromTracks(tracks, 'author')).toEqual(['Artist A', 'Artist B']);
    });

    test('обрабатывает строки с пробелами', () => {
      const tracks: TestTrack[] = [
        { author: '  Artist A  ' },
        { author: 'Artist B' },
      ];
      
      expect(getUniqueValuesFromTracks(tracks, 'author')).toEqual(['  Artist A  ', 'Artist B']);
    });
  });
});