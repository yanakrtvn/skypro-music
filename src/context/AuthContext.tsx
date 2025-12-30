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

  useEffect(() => {
    const initAuth = async () => {
      const storedUser = localStorage.getItem('user');
      const storedAccessToken = localStorage.getItem('accessToken');
      const storedRefreshToken = localStorage.getItem('refreshToken');

      if (storedUser && storedAccessToken && storedRefreshToken) {
        try {
          const isValid = await ApiClient.verifyToken(storedAccessToken);
          
          if (!isValid) {
            const newAccessToken = await refreshAccessToken();
            
            if (!newAccessToken) {
              localStorage.removeItem('user');
              localStorage.removeItem('accessToken');
              localStorage.removeItem('refreshToken');
              setUser(null);
              setAccessToken(null);
              setRefreshToken(null);
            } else {
              setUser(JSON.parse(storedUser));
              setAccessToken(newAccessToken);
              setRefreshToken(storedRefreshToken);
            }
          } else {
            setUser(JSON.parse(storedUser));
            setAccessToken(storedAccessToken);
            setRefreshToken(storedRefreshToken);
          }
        } catch (err) {
          console.error('Error during auth initialization:', err);

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

      const userData = await ApiClient.login(email, password);
      
      const tokens = await ApiClient.getTokens(email, password);

      setUser(userData);
      setAccessToken(tokens.access);
      setRefreshToken(tokens.refresh);
      
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('accessToken', tokens.access);
      localStorage.setItem('refreshToken', tokens.refresh);

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
      const response = await ApiClient.signup(email, password, username);

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