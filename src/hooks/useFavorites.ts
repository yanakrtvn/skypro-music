import { useState, useCallback, useMemo } from 'react';
import { ApiClient } from '@/api/client';
import { Track } from '@/types/api';
import { useNotification } from '@/context/NotificationContext';
import { useAuth } from '@/context/AuthContext';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { 
  setFavoriteTracks, 
  addToFavorites as addToFavoritesRedux, 
  removeFromFavorites as removeFromFavoritesRedux,
  setFavoritesLoading 
} from '@/store/features/trackSlice';

export const useFavorite = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const { showError, showSuccess } = useNotification();
  const { user } = useAuth();
  const dispatch = useAppDispatch();
  
  const { favoriteTrackIds } = useAppSelector((state) => state.tracks);

  const loadFavoritesFromServer = useCallback(async () => {
    if (!user) {
      dispatch(setFavoriteTracks([]));
      return;
    }

    try {
      dispatch(setFavoritesLoading(true));
      const favorites = await ApiClient.getFavoriteTracks();
      dispatch(setFavoriteTracks(favorites));
    } catch (err) {
      console.error('Ошибка загрузки избранных треков:', err);
      dispatch(setFavoriteTracks([]));
      showError('Не удалось загрузить избранные треки');
    }
  }, [user, dispatch, showError]);

  const checkIfFavorite = useCallback((trackId: number): boolean => {
    return favoriteTrackIds.includes(trackId);
  }, [favoriteTrackIds]);

  const toggleFavorite = useCallback(async (track: Track, isCurrentlyFavorite: boolean): Promise<boolean> => {
    if (!user) {
      showError('Для добавления в избранное необходимо авторизоваться');
      return isCurrentlyFavorite;
    }

    setLoading(true);

    try {
      if (isCurrentlyFavorite) {
        await ApiClient.removeFromFavorites(track._id);
        dispatch(removeFromFavoritesRedux(track._id));
        showSuccess(`Трек "${track.name}" удален из избранного`);
      } else {
        await ApiClient.addToFavorites(track._id);
        dispatch(addToFavoritesRedux(track));
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
  }, [user, dispatch, showError, showSuccess]);

  return useMemo(() => ({
    toggleFavorite,
    checkIfFavorite,
    loadFavoritesFromServer,
    loading,
  }), [toggleFavorite, checkIfFavorite, loadFavoritesFromServer, loading]);
};