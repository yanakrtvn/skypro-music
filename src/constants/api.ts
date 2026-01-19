// constants/api.ts
export const API_CONFIG = {
  BASE_URL: 'https://webdev-music-003b5b991590.herokuapp.com',
  ENDPOINTS: {
    SIGNUP: '/user/signup/',
    LOGIN: '/user/login/',
    TOKENS: '/user/token/',
    REFRESH_TOKEN: '/user/token/refresh/',
    VERIFY_TOKEN: '/user/token/verify/',
    ALL_TRACKS: '/catalog/track/all/',
    FAVORITE_TRACKS: '/catalog/track/favorite/all/',
    ADD_FAVORITE: (trackId: number) => `/catalog/track/${trackId}/favorite/`,
    REMOVE_FAVORITE: (trackId: number) => `/catalog/track/${trackId}/favorite/`,
    PLAYLISTS: '/catalog/selection/all',
    PLAYLIST_BY_ID: (id: number) => `/catalog/selection/${id}/`,
  },
  TOKEN_EXPIRY: 200, 
  RETRY_COUNT: 3,
  TIMEOUT: 10000,
} as const;

export const STORAGE_KEYS = {
  USER: 'user',
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
  FAVORITE_TRACKS: 'favoriteTracks',
  VOLUME: 'volume',
  THEME: 'theme',
} as const;

export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Ошибка сети. Проверьте подключение к интернету.',
  UNAUTHORIZED: 'Требуется авторизация.',
  SESSION_EXPIRED: 'Сессия истекла. Пожалуйста, войдите снова.',
  SERVER_ERROR: 'Ошибка сервера. Пожалуйста, попробуйте позже.',
  VALIDATION_ERROR: 'Ошибка валидации данных.',
  NOT_FOUND: 'Ресурс не найден.',
  DEFAULT: 'Произошла ошибка. Пожалуйста, попробуйте снова.',
} as const;

export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Вы успешно авторизованы!',
  LOGOUT_SUCCESS: 'Вы успешно вышли из системы.',
  FAVORITE_ADDED: 'Трек добавлен в избранное.',
  FAVORITE_REMOVED: 'Трек удален из избранного.',
} as const;