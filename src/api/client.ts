import { 
  APIError, 
  AuthResponse, 
  TokenResponse, 
  Track, 
  Playlist 
} from '@/types/api';

const BASE_URL = 'https://webdev-music-003b5b991590.herokuapp.com';

export class ApiClient {
  private static async request<T>(
    endpoint: string, 
    options: RequestInit = {}, 
    skipJsonParse = false
  ): Promise<T> {
    const url = `${BASE_URL}${endpoint}`;
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
    };

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        try {
          const error: APIError = await response.json();
          throw new Error(error.message || error.detail || `HTTP ${response.status}`);
        } catch {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
      }

      if (skipJsonParse) {
        return undefined as T;
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      }
      
      return undefined as T;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error');
    }
  }

  // Регистрация
  static async signup(email: string, password: string, username: string): Promise<AuthResponse> {
    return this.request<AuthResponse>('/user/signup/', {
      method: 'POST',
      body: JSON.stringify({ email, password, username }),
    });
  }

  // Вход
  static async login(email: string, password: string): Promise<AuthResponse> {
    const response = await this.request<{ 
      success?: boolean; 
      result?: AuthResponse; 
      email?: string; 
      username?: string; 
      _id?: number;
      message?: string;
    }>('/user/login/', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (response.email && response.username && response._id) {
      return {
        email: response.email,
        username: response.username,
        _id: response._id,
      };
    } else if (response.result) {
      return response.result;
    }
    
    throw new Error(response.message || 'Неверный формат ответа');
  }

  // Получение токенов
  static async getTokens(email: string, password: string): Promise<TokenResponse> {
    return this.request<TokenResponse>('/user/token/', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  // Обновление токена
  static async refreshToken(refreshToken: string): Promise<{ access: string }> {
    return this.request<{ access: string }>('/user/token/refresh/', {
      method: 'POST',
      body: JSON.stringify({ refresh: refreshToken }),
    });
  }

  // Проверка валидности токена
  static async verifyToken(accessToken: string): Promise<boolean> {
    try {
      await this.request('/user/token/verify/', {
        method: 'POST',
        body: JSON.stringify({ token: accessToken }),
      });
      return true;
    } catch {
      return false;
    }
  }

  // Получить все треки
  static async getAllTracks(): Promise<Track[]> {
    const response = await this.request<{ 
      success: boolean; 
      data: Track[];
      message?: string;
    }>('/catalog/track/all/');
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Failed to load tracks');
  }

  // Получить подборки
  static async getPlaylists(): Promise<Playlist[]> {
    try {
      const response = await this.request<{ 
        success: boolean; 
        data: Playlist[];
        message?: string;
      }>('/catalog/selection/all');
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to load playlists');
      }
      
      return response.data || [];
    } catch (error) {
      console.error('Error in getPlaylists:', error);
      throw error;
    }
  }

  static async getPlaylistById(id: number): Promise<Playlist> {
    const response = await this.request<{
      success?: boolean;
      data?: Playlist;
      _id?: number;
      name?: string;
      items?: Track[];
      tracks?: Track[];
      detail?: string;
      message?: string;
    }>(`/catalog/selection/${id}/`);
    
    if (response.success === false) {
      throw new Error(response.detail || response.message || 'Failed to load playlist');
    }

    if (response.data) {
      return response.data;
    }
    
    if (response._id && response.name) {
      return {
        _id: response._id,
        name: response.name,
        items: response.items || response.tracks || []
      };
    }
    
    throw new Error('Invalid playlist response format');
  }

  static async getFavoriteTracks(accessToken: string): Promise<Track[]> {
    return this.request<Track[]>('/catalog/track/favorite/all/', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  }

  static async addToFavorites(trackId: number, accessToken: string): Promise<void> {
    await this.request(`/catalog/track/${trackId}/favorite/`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }, true);
  }

  static async removeFromFavorites(trackId: number, accessToken: string): Promise<void> {
    await this.request(`/catalog/track/${trackId}/favorite/`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }, true);
  }
}