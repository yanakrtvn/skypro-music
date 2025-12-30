import { 
  APIError, 
  AuthResponse, 
  TokenResponse, 
  Track, 
  Playlist 
} from '@/types/api';

const BASE_URL = 'https://webdev-music-003b5b991590.herokuapp.com';

export class ApiClient {
  private static async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
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
        const error: APIError = await response.json();
        throw new Error(error.message || error.detail || `HTTP ${response.status}`);
      }

      return await response.json();
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
    return this.request<AuthResponse>('/user/login/', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
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

  // Получить все треки
  static async getAllTracks(): Promise<Track[]> {
  return this.request<{ success: boolean; data: Track[] }>('/catalog/track/all/')
    .then(response => response.data);
}

  // Получить подборки
  static async getPlaylists(): Promise<Playlist[]> {
  try {
    const response = await this.request<{ success: boolean; data: Playlist[] }>('/catalog/selection/all');
    
    if (!response.success) {
      throw new Error('Failed to load playlists');
    }
    
    return response.data || [];
  } catch (error) {
    console.error('Error in getPlaylists:', error);
    return [];
  }
}

  static async getPlaylistById(id: number): Promise<Playlist> {
  try {
    const response = await this.request<{
      success?: boolean;
      data?: Playlist;
      _id?: number;
      name?: string;
      items?: Track[];
      tracks?: Track[];
      detail?: string;
    }>(`/catalog/selection/${id}/`);
    
    if (response.success === false) {
      throw new Error(response.detail || 'Failed to load playlist');
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
    
    if (response.items || response.tracks) {
      return {
        _id: id,
        name: response.name || 'Плейлист',
        items: response.items || response.tracks || []
      };
    }
    
    throw new Error('Invalid playlist response format');
    
  } catch (error) {
    console.error(`Error getting playlist ${id}:`, error);
    throw error;
  }
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
    });
  }

  static async removeFromFavorites(trackId: number, accessToken: string): Promise<void> {
    await this.request(`/catalog/track/${trackId}/favorite/`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  }
}