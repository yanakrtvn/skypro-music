'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { ApiClient } from '@/api/client'; 
import { useAppDispatch } from '@/store/hooks';
import { clearFavorites, setFavoriteTracks } from '@/store/features/trackSlice';

interface AuthContextType {
  user: { email: string; username: string; _id: number } | null;
  accessToken: string | null;
  refreshToken: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, username: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  error: string | null;
  refreshAccessToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthContextType['user']>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();

  const logout = useCallback(() => {
    setUser(null);
    setAccessToken(null);
    setRefreshToken(null);

    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('favoriteTracks');

    dispatch(clearFavorites());

    if (window) {
      window.dispatchEvent(new Event('authStateChanged'));
      window.dispatchEvent(new Event('favoritesUpdated'));
    }

    if (pathname?.includes('/favorites')) {
      router.push('/');
    }

    router.push('/signin');
  }, [router, pathname, dispatch]);

  const refreshAccessToken = useCallback(async (): Promise<string | null> => {
    const currentRefreshToken = localStorage.getItem('refreshToken');
    
    if (!currentRefreshToken) {
      logout();
      return null;
    }

    try {
      const response = await ApiClient.refreshToken(currentRefreshToken);
      const newAccessToken = response.access;
      
      localStorage.setItem('accessToken', newAccessToken);
      setAccessToken(newAccessToken);
      
      return newAccessToken;
    } catch (err) {
      console.error('Failed to refresh access token:', err);
      logout();
      return null;
    }
  }, [logout]);

  const loadUserFavorites = useCallback(async (): Promise<void> => {
  const currentAccessToken = localStorage.getItem('accessToken');
  const currentRefreshToken = localStorage.getItem('refreshToken');
  
  if (!currentAccessToken || !currentRefreshToken) {
    dispatch(setFavoriteTracks([]));
    return;
  }
  
  try {
    const favorites = await ApiClient.getFavoriteTracks();
    dispatch(setFavoriteTracks(favorites));
  } catch (err) {
    console.error('Ошибка загрузки избранных треков:', err);
    
    const newToken = await refreshAccessToken();
    
    if (newToken) {
      try {
        const favorites = await ApiClient.getFavoriteTracks();
        dispatch(setFavoriteTracks(favorites));
        return;
      } catch (retryErr) {
        console.error('Ошибка после обновления токена:', retryErr);
      }
    }

    dispatch(setFavoriteTracks([]));
  }
}, [dispatch, refreshAccessToken]);

  const initAuth = useCallback(async () => {
    const storedUser = localStorage.getItem('user');
    const storedAccessToken = localStorage.getItem('accessToken');
    const storedRefreshToken = localStorage.getItem('refreshToken');

    if (storedUser && storedAccessToken && storedRefreshToken) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        setAccessToken(storedAccessToken);
        setRefreshToken(storedRefreshToken);        
        
        setTimeout(() => {
          loadUserFavorites();
        }, 100);
      } catch (err) {
        console.error('Error during auth initialization:', err);
        logout();
      }
    } else {
    }
    setIsLoading(false);
  }, [loadUserFavorites, logout]);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const userData = await ApiClient.login(email, password);
      const tokens = await ApiClient.getTokens(email, password);

      setUser(userData);
      setAccessToken(tokens.access);
      setRefreshToken(tokens.refresh);
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('accessToken', tokens.access);
      localStorage.setItem('refreshToken', tokens.refresh);
    
      setTimeout(() => {
        loadUserFavorites();
        window.dispatchEvent(new Event('authStateChanged'));
      }, 100);
      
      router.push('/');
    } catch (err) {
      console.error('Ошибка входа:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [router, loadUserFavorites]);

  const signup = useCallback(async (email: string, password: string, username: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await ApiClient.signup(email, password, username);
      await login(email, password);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка регистрации';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [login]);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  useEffect(() => {
    const handleUnauthorized = () => {
      logout();
    };

    window.addEventListener('unauthorized', handleUnauthorized);
    
    return () => {
      window.removeEventListener('unauthorized', handleUnauthorized);
    };
  }, [logout]);

  const value: AuthContextType = {
    user,
    accessToken,
    refreshToken,
    login,
    signup,
    logout,
    isLoading,
    error,
    refreshAccessToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}