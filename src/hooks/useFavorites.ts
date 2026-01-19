import { useState, useCallback, useMemo } from 'react';
import { ApiClient } from '@/api/client';
import { Track } from '@/types/api';
import { useNotification } from '@/context/NotificationContext';
import { useAuth } from '@/context/AuthContext';

export const useFavorite = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const { showError, showSuccess } = useNotification();
  const { user } = useAuth();

  const toggleFavorite = useCallback(async (track: Track, isCurrentlyFavorite: boolean): Promise<boolean> => {
    if (!user) {
      showError('Для добавления в избранное необходимо авторизоваться');
      return isCurrentlyFavorite;
    }

    setLoading(true);

    try {
      if (isCurrentlyFavorite) {
        await ApiClient.removeFromFavorites(track._id);
        showSuccess(`Трек "${track.name}" удален из избранного`);
      } else {
        await ApiClient.addToFavorites(track._id);
        showSuccess(`Трек "${track.name}" добавлен в избранное`);
      }

      const event = new CustomEvent('favoriteUpdated', {
        detail: { 
          trackId: track._id, 
          isFavorite: !isCurrentlyFavorite,
          track: track
        }
      });
      window.dispatchEvent(event);
      if (window.location.pathname.includes('/favorites')) {
        const favoritesEvent = new CustomEvent('favoritesUpdated');
        window.dispatchEvent(favoritesEvent);
      }

      return !isCurrentlyFavorite;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка при обновлении избранного';
      showError(errorMessage);
      console.error('Ошибка при переключении лайка:', err);
      return isCurrentlyFavorite;
    } finally {
      setLoading(false);
    }
  }, [user, showError, showSuccess]);

  const checkIfFavorite = useCallback((trackId: number): boolean => {
    try {
      const favoritesString = localStorage.getItem('favoriteTracks');
      if (!favoritesString) return false;
      
      const favoriteTracks = JSON.parse(favoritesString);

      if (!Array.isArray(favoriteTracks)) {
        console.error('Некорректные данные в localStorage. Очищаем...');
        localStorage.removeItem('favoriteTracks');
        return false;
      }
      
      return favoriteTracks.some((track: Track) => track && track._id === trackId);
    } catch (err) {
      console.error('Ошибка при проверке избранного:', err);
      localStorage.removeItem('favoriteTracks');
      return false;
    }
  }, []);

  const updateLocalFavorites = useCallback((track: Track, isFavorite: boolean): void => {
    try {
      const favoritesString = localStorage.getItem('favoriteTracks');
      let favoriteTracks: Track[] = [];
      
      if (favoritesString) {
        try {
          const parsed = JSON.parse(favoritesString);
          if (Array.isArray(parsed)) {
            favoriteTracks = parsed;
          }
        } catch {
          favoriteTracks = [];
        }
      }
      
      if (isFavorite) {
        if (!favoriteTracks.some(t => t && t._id === track._id)) {
          favoriteTracks.push(track);
        }
      } else {
        favoriteTracks = favoriteTracks.filter(t => t && t._id !== track._id);
      }
      
      localStorage.setItem('favoriteTracks', JSON.stringify(favoriteTracks));

      const event = new CustomEvent('trackLikesUpdated', {
        detail: { trackId: track._id, isFavorite }
      });
      window.dispatchEvent(event);
    } catch (err) {
      console.error('Ошибка при обновлении локальных избранных:', err);
      localStorage.removeItem('favoriteTracks');
    }
  }, []);

  const fixLocalStorage = useCallback(() => {
    try {
      const favoritesString = localStorage.getItem('favoriteTracks');
      if (favoritesString) {
        const parsed = JSON.parse(favoritesString);
        if (!Array.isArray(parsed)) {
          console.log('Обнаружены некорректные данные в localStorage. Очищаем...');
          localStorage.removeItem('favoriteTracks');
          window.dispatchEvent(new Event('favoritesUpdated'));
          return true;
        }
      }
      return false;
    } catch {
      localStorage.removeItem('favoriteTracks');
      window.dispatchEvent(new Event('favoritesUpdated'));
      return true;
    }
  }, []);

  return useMemo(() => ({
    toggleFavorite,
    checkIfFavorite,
    updateLocalFavorites,
    fixLocalStorage,
    loading,
  }), [toggleFavorite, checkIfFavorite, updateLocalFavorites, fixLocalStorage, loading]);
};