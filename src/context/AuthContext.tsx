'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useRouter } from 'next/navigation';
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

  // Функция для обновления access токена
  const refreshAccessToken = useCallback(async (): Promise<string | null> => {
    const currentRefreshToken = localStorage.getItem('refreshToken');
    
    if (!currentRefreshToken) {
      console.log('No refresh token available');
      return null;
    }

    try {
      console.log('Refreshing access token...');
      const response = await ApiClient.refreshToken(currentRefreshToken);
      const newAccessToken = response.access;
      
      localStorage.setItem('accessToken', newAccessToken);
      setAccessToken(newAccessToken);
      
      console.log('Access token refreshed successfully');
      return newAccessToken;
    } catch (err) {
      console.error('Failed to refresh access token:', err);
      // Если refresh токен недействителен, выходим из системы
      logout();
      return null;
    }
  }, []);

  // Проверяем валидность токена при загрузке
  useEffect(() => {
    const initAuth = async () => {
      const storedUser = localStorage.getItem('user');
      const storedAccessToken = localStorage.getItem('accessToken');
      const storedRefreshToken = localStorage.getItem('refreshToken');

      if (storedUser && storedAccessToken && storedRefreshToken) {
        try {
          // Проверяем валидность access токена
          const isValid = await ApiClient.verifyToken(storedAccessToken);
          
          if (!isValid) {
            // Пытаемся обновить токен
            const newAccessToken = await refreshAccessToken();
            
            if (!newAccessToken) {
              // Не удалось обновить, очищаем данные
              localStorage.removeItem('user');
              localStorage.removeItem('accessToken');
              localStorage.removeItem('refreshToken');
              setUser(null);
              setAccessToken(null);
              setRefreshToken(null);
            } else {
              // Обновили успешно, устанавливаем пользователя
              setUser(JSON.parse(storedUser));
              setAccessToken(newAccessToken);
              setRefreshToken(storedRefreshToken);
            }
          } else {
            // Токен валиден, устанавливаем пользователя
            setUser(JSON.parse(storedUser));
            setAccessToken(storedAccessToken);
            setRefreshToken(storedRefreshToken);
          }
        } catch (err) {
          console.error('Error during auth initialization:', err);
          // В случае ошибки очищаем данные
          localStorage.removeItem('user');
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, [refreshAccessToken]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // 1. Авторизуем пользователя
      const userData = await ApiClient.login(email, password);
      
      // 2. Получаем токены
      const tokens = await ApiClient.getTokens(email, password);
      
      // 3. Сохраняем данные
      setUser(userData);
      setAccessToken(tokens.access);
      setRefreshToken(tokens.refresh);
      
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('accessToken', tokens.access);
      localStorage.setItem('refreshToken', tokens.refresh);
      
      // 4. Перенаправляем на главную
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
      // 1. Регистрируем пользователя
      const response = await ApiClient.signup(email, password, username);
      
      // 2. Автоматически входим после регистрации
      await login(email, password);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка регистрации';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setAccessToken(null);
    setRefreshToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    router.push('/signin');
  };

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