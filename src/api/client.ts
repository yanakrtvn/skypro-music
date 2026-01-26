import { 
  APIError, 
  AuthResponse, 
  TokenResponse, 
  Track, 
  Playlist,
  FavoriteTracksResponse
} from '@/types/api';
import { withReAuth } from './withReAuth';

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
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      
      try {
        const errorData = await response.json();
       
        if (typeof errorData === 'object' && errorData !== null) {
          errorMessage = 
            errorData.message || 
            errorData.detail || 
            errorData.error || 
            (typeof errorData === 'string' ? errorData : JSON.stringify(errorData));
        } else if (typeof errorData === 'string') {
          errorMessage = errorData;
        }
      } catch {
        if (response.status === 400) {
          errorMessage = 'Неверные данные. Проверьте введенную информацию';
        } else if (response.status === 401) {
          errorMessage = 'Требуется авторизация';
        } else if (response.status === 403) {
          errorMessage = 'Доступ запрещен';
        } else if (response.status === 404) {
          errorMessage = 'Ресурс не найден';
        } else if (response.status === 500) {
          errorMessage = 'Ошибка сервера';
        }
      }

      throw new Error(errorMessage);
    }

    if (skipJsonParse) {
      return undefined as T;
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const json = await response.json();
      return json;
    }

    return undefined as T;
  } catch (error) {
    console.error(`[API] Ошибка запроса ${url}:`, error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Network error');
  }
}

  private static async requestWithAuth<T>(
  endpoint: string,
  options: RequestInit = {},
  skipJsonParse = false
): Promise<T> {
  const accessToken = localStorage.getItem('accessToken');
  const refreshToken = localStorage.getItem('refreshToken');
  
  if (!accessToken || !refreshToken) {
    throw new Error('Требуется авторизация');
  }
  
  const requestFn = async (): Promise<T> => {
    return this.request<T>(endpoint, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
        Authorization: `Bearer ${accessToken}`,
      },
    }, skipJsonParse);
  };
  
  return withReAuth(requestFn, accessToken, refreshToken);
}

  // Регистрация
  static async signup(email: string, password: string, username: string): Promise<AuthResponse> {
  try {
    const response = await this.request<AuthResponse>('/user/signup/', {
      method: 'POST',
      body: JSON.stringify({ email, password, username }),
    });
    
    return response;
  } catch (error) {
    if (error instanceof Error) {
      const errorMessage = error.message.toLowerCase();

      if (errorMessage.includes('только цифры и латинские буквы') || 
          errorMessage.includes('user validation failed') ||
          errorMessage.includes('username')) {
        if (errorMessage.includes('только цифры и латинские буквы')) {
          throw new Error('Имя пользователя может содержать только цифры, латинские буквы и символы @ . + - _');
        }
      }

      if (errorMessage.includes('email already exists') || 
          errorMessage.includes('email уже существует') ||
          errorMessage.includes('уже зарегистрирован')) {
        throw new Error('Пользователь с таким email уже зарегистрирован');
      }
      
      if (errorMessage.includes('username already exists') || 
          errorMessage.includes('имя пользователя уже используется')) {
        throw new Error('Это имя пользователя уже занято');
      }
      
      if (errorMessage.includes('password') || errorMessage.includes('парол')) {
        if (errorMessage.includes('short') || errorMessage.includes('коротк')) {
          throw new Error('Пароль слишком короткий');
        }
        if (errorMessage.includes('weak') || errorMessage.includes('слаб')) {
          throw new Error('Пароль слишком слабый');
        }
      }
      
      if (errorMessage.includes('email') || errorMessage.includes('почт')) {
        if (errorMessage.includes('invalid') || errorMessage.includes('неверн')) {
          throw new Error('Неверный формат email');
        }
      }

      if (errorMessage.includes('400') || errorMessage.includes('bad request')) {
        throw new Error('Проверьте введенные данные. Возможно, некоторые поля заполнены неверно');
      }
      
      throw error;
    }
    
    throw new Error('Ошибка регистрации');
  }
}

  // Вход
  static async login(email: string, password: string): Promise<AuthResponse> {
  try {
    const response = await this.request<{ 
      success?: boolean; 
      result?: AuthResponse; 
      email?: string; 
      username?: string; 
      _id?: number;
      message?: string;
      detail?: string;
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
    
    throw new Error('Неверный формат ответа от сервера');
  } catch (error) {
    if (error instanceof Error) {
      const errorMessage = error.message.toLowerCase();

      if (errorMessage.includes('только цифры и латинские буквы') || 
          errorMessage.includes('user validation failed') ||
          errorMessage.includes('username')) {
        if (errorMessage.includes('только цифры и латинские буквы')) {
          throw new Error('Имя пользователя может содержать только цифры, латинские буквы и символы @ . + - _');
        }
      }

      if (errorMessage.includes('неверные данные') || 
          errorMessage.includes('invalid') || 
          errorMessage.includes('400') ||
          errorMessage.includes('bad request') ||
          errorMessage.includes('неверный email или пароль')) {
        throw new Error('Неверный email или пароль');
      }
      
      if (errorMessage.includes('401') || 
          errorMessage.includes('unauthorized') || 
          errorMessage.includes('не авторизован')) {
        throw new Error('Неверный email или пароль');
      }
      
      if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
        throw new Error('Проблемы с подключением к серверу');
      }

      if (errorMessage.length < 100 && 
          !errorMessage.includes('http') && 
          !errorMessage.includes('status')) {
        const formattedMessage = errorMessage.charAt(0).toUpperCase() + errorMessage.slice(1);
        throw new Error(formattedMessage);
      }

      throw new Error('Ошибка входа. Проверьте введенные данные');
    }
    
    throw new Error('Неизвестная ошибка при входе');
  }
}

  static async getTokens(email: string, password: string): Promise<TokenResponse> {
    return this.request<TokenResponse>('/user/token/', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  static async refreshToken(refreshToken: string): Promise<{ access: string }> {
    return this.request<{ access: string }>('/user/token/refresh/', {
      method: 'POST',
      body: JSON.stringify({ refresh: refreshToken }),
    });
  }

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

  static async getAllTracks(): Promise<Track[]> {
  
  try {   
    const response = await this.requestWithAuth<{ 
      success: boolean; 
      data: Track[];
      message?: string;
    }>('/catalog/track/all/', {
      method: 'GET',
    });

    
    if (response.success && response.data) {
      return response.data;
    }
    
    console.error('Ошибка в формате ответа (с авторизацией):', response);
    throw new Error(response.message || 'Failed to load tracks');
    
  } catch (authError) {
    console.log('Не удалось загрузить с авторизацией, пробуем без...', authError);

    try {
      const response = await this.request<{ 
        success: boolean; 
        data: Track[];
        message?: string;
      }>('/catalog/track/all/', {
        method: 'GET',
      });
      
      if (response.success && response.data) {
        return response.data;
      }
      
      console.error('Ошибка в формате ответа (без авторизации):', response);
      throw new Error(response.message || 'Failed to load tracks');
      
    } catch (error) {
      console.error('Ошибка при загрузке треков без авторизации:', error);
      throw error;
    }
  }
}

  static async getPlaylistById(id: number): Promise<Playlist> {
    try {
      type PlaylistResponse = {
        success?: boolean;
        data?: {
          _id?: number;
          name?: string;
          items?: (Track | number)[];
          tracks?: (Track | number)[];
        };
        _id?: number;
        name?: string;
        items?: (Track | number)[];
        tracks?: (Track | number)[];
        detail?: string;
        message?: string;
      };

      const response = await this.request<PlaylistResponse>(`/catalog/selection/${id}/`);

      const handleEmptyPlaylist = async (playlistId: number): Promise<Track[]> => {
        if (playlistId === 1) {
          try {
            const allTracks = await this.getAllTracks();
            const popularTracks = [...allTracks]
              .sort((a, b) => {
                const aFavorites = a.stared_user?.length || 0;
                const bFavorites = b.stared_user?.length || 0;
                return bFavorites - aFavorites;
              })
              .slice(0, 20);
            
            return popularTracks;
          } catch (err) {
            console.error('Ошибка при загрузке популярных треков:', err);
            return [];
          }
        }
        return [];
      };

      const getTracksFromIds = async (trackIds: number[]): Promise<Track[]> => {
        if (!trackIds || trackIds.length === 0) {
          return await handleEmptyPlaylist(id);
        }
        
        try {
          const allTracks = await this.getAllTracks();
          const tracksMap = new Map<number, Track>();
          allTracks.forEach(track => {
            if (track && track._id !== undefined) {
              tracksMap.set(track._id, track);
            }
          });
          
          const tracks = trackIds
            .map(id => tracksMap.get(id))
            .filter((track): track is Track => track !== undefined);
          
          if (tracks.length === 0 && id === 1) {
            return await handleEmptyPlaylist(id);
          }
          
          return tracks;
        } catch (err) {
          console.error('Ошибка при получении треков по ID:', err);
          return await handleEmptyPlaylist(id);
        }
      };

      let items: (Track | number)[] = [];
      let playlistNameFromApi = '';
      let playlistId = id;

      if (response.success !== false && response.data) {
        items = response.data.items || response.data.tracks || [];
        playlistNameFromApi = response.data.name || '';
        playlistId = response.data._id || id;
      } else if (response._id || response.name) {
        items = response.items || response.tracks || [];
        playlistNameFromApi = response.name || '';
        playlistId = response._id || id;
      }

      const finalPlaylistName = (() => {
        switch(id) {
          case 1:
            return 'Плейлист дня';
          case 2:
            return '100 танцевальных хитов';
          case 3:
            return 'Инди-заряд';
          default:
            return playlistNameFromApi && playlistNameFromApi.trim() !== '' 
              ? playlistNameFromApi 
              : `Плейлист ${id}`;
        }
      })();

      const firstItem = items[0];
      let validTracks: Track[] = [];

      if (items.length === 0) {
        validTracks = await handleEmptyPlaylist(id);
      } else if (typeof firstItem === 'number') {
        validTracks = await getTracksFromIds(items as number[]);
      } else if (firstItem && typeof firstItem === 'object' && '_id' in firstItem) {
        validTracks = items.filter((item): item is Track => {
          const track = item as Track;
          return (
            track._id !== undefined &&
            track.name !== undefined &&
            track.author !== undefined
          );
        });
      }

      return {
        _id: playlistId,
        name: finalPlaylistName,
        items: validTracks,
        tracks: validTracks
      };
      
    } catch (error) {
      console.error('Error in getPlaylistById:', error);
      if (id === 1) {
        try {
          const allTracks = await this.getAllTracks();
          const popularTracks = allTracks.slice(0, 15);
          return {
            _id: id,
            name: 'Плейлист дня',
            items: popularTracks,
            tracks: popularTracks
          };
        } catch (fallbackError) {
          console.error('Fallback also failed:', fallbackError);
        }
      }

      let fallbackName = `Плейлист ${id}`;
      if (id === 1) fallbackName = 'Плейлист дня';
      if (id === 2) fallbackName = '100 танцевальных хитов';
      if (id === 3) fallbackName = 'Инди-заряд';
      
      return {
        _id: id,
        name: fallbackName,
        items: [],
        tracks: []
      };
    }
  }

  static async getFavoriteTracks(): Promise<Track[]> {
  try {
    const response = await this.requestWithAuth<FavoriteTracksResponse>('/catalog/track/favorite/all/', {
      method: 'GET',
    });

    if (Array.isArray(response)) {
      return response;
    } else if (response && typeof response === 'object') {
      if (Array.isArray(response.data)) {
        return response.data;
      } else if (Array.isArray(response.result)) {
        return response.result;
      } else if (Array.isArray(response.tracks)) {
        return response.tracks;
      } else if (Array.isArray(response.items)) {
        return response.items;
      }
    }
    
    console.warn('getFavoriteTracks: неверный формат ответа, возвращаем пустой массив', response);
    return [];
    
  } catch (error) {
    console.error('Ошибка загрузки избранных треков:', error);

    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage.includes('401') || errorMessage.includes('Unauthorized')) {
      throw new Error('Необходима авторизация. Пожалуйста, войдите снова.');
    }
    
    throw error;
  }
}

  static async addToFavorites(trackId: number): Promise<void> {
    await this.requestWithAuth(`/catalog/track/${trackId}/favorite/`, {
      method: 'POST',
    }, true);
  }

  static async removeFromFavorites(trackId: number): Promise<void> {
    await this.requestWithAuth(`/catalog/track/${trackId}/favorite/`, {
      method: 'DELETE',
    }, true);
  }

  static async getServerFavoriteTracks(): Promise<Track[]> {
    try {
      const tracks = await this.getFavoriteTracks();
      return tracks;
    } catch (error) {
      console.error('Ошибка загрузки избранных треков с сервера:', error);
      return [];
    }
  }
}