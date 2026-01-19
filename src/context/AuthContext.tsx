'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { ApiClient } from '@/api/client'; 

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

  const refreshAccessToken = useCallback(async (): Promise<string | null> => {
    const currentRefreshToken = localStorage.getItem('refreshToken');
    
    if (!currentRefreshToken) {
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
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setAccessToken(null);
    setRefreshToken(null);

    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('favoriteTracks');

    if (window) {
      window.dispatchEvent(new Event('authStateChanged'));
      window.dispatchEvent(new Event('favoritesUpdated'));
    }

    if (pathname?.includes('/favorites')) {
      router.push('/');
    }

    router.push('/signin');
  }, [router, pathname]);

  useEffect(() => {
  const initAuth = async () => {
    const storedUser = localStorage.getItem('user');
    const storedAccessToken = localStorage.getItem('accessToken');
    const storedRefreshToken = localStorage.getItem('refreshToken');

    if (storedUser && storedAccessToken && storedRefreshToken) {
      try {
        setUser(JSON.parse(storedUser));
        setAccessToken(storedAccessToken);
        setRefreshToken(storedRefreshToken);
      } catch (err) {
        console.error('Error during auth initialization:', err);
        logout();
      }
    }
    setIsLoading(false);
  };

  initAuth();
}, [logout]);

  const login = async (email: string, password: string) => {
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
      window.dispatchEvent(new Event('authStateChanged'));

      router.push('/');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка входа';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, password: string, username: string) => {
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
  };

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