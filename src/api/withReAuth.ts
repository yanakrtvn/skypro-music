import { ApiClient } from './client';

interface RequestError extends Error {
  message: string;
}

export const withReAuth = async <T>(
  requestFn: () => Promise<T>,
  accessToken: string | null,
  refreshToken: string | null
): Promise<T> => {
  try {
    return await requestFn();
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);

    if (errorMessage.includes('401') || 
        errorMessage.includes('Unauthorized') || 
        errorMessage.includes('Учетные данные не были предоставлены') ||
        errorMessage.includes('токен не действителен')) {
      
      if (!refreshToken) {
        window.dispatchEvent(new Event('unauthorized'));
        throw new Error('Необходима авторизация');
      }
      
      try {
        const { access: newAccessToken } = await ApiClient.refreshToken(refreshToken);
        localStorage.setItem('accessToken', newAccessToken);

        return await requestFn();
      } catch (refreshError) {
        console.error('Ошибка обновления токена:', refreshError);
        window.dispatchEvent(new Event('unauthorized'));
        throw new Error('Сессия истекла. Пожалуйста, войдите снова.');
      }
    }
    throw error;
  }
};