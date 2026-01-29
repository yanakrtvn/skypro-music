Skypro.Music 🎵
Музыкальное веб-приложение с современным интерфейсом для прослушивания треков, управления плейлистами и избранным.

Приложение позволяет: 
- Прослушивать музыкальные треки
- Создавать и управлять избранными треками
- Работать с плейлистами
- Использовать фильтры и поиск
- Управлять воспроизведением через современный аудиоплеер

Технологии 🛠
  -Next.js
  -TypeScript
  -Redux Toolkit
  -React Hooks
  -CSS Modules
  -Node.js 
  -npm 
  -Git 
  -REST API

Установка
  1) Клонирование репозитория
    git clone <repository-url>
    cd skypro-music
  2) Установка зависимостей
    npm install
  3) Запуск в режиме разработки
    npm run dev
    
 ✔ Приложение будет доступно по адресу: http://localhost:3000


✨ Функциональность
  🎵 Аудиоплеер
    -Воспроизведение/пауза треков
    -Переключение между треками (следующий/предыдущий)
    -Регулировка громкости
    -Режим повтора (loop)
    -Режим перемешивания (shuffle)
    -Отображение прогресса воспроизведения
    -Таймер текущего времени
  
  🔐 Авторизация
    -Регистрация нового пользователя
    -Вход в систему
    -Автоматическое обновление токенов
    -Защищенные маршруты
    -Выход из системы
  
📁 Структура проекта

```mermaid
graph TD
    A[skypro-music/] --> B[app/]
    A --> C[components/]
    A --> D[store/]
    A --> E[api/]
    A --> F[types/]
    A --> G[hooks/]
    A --> H[context/]
    A --> I[utils/]
    A --> J[public/]
    A --> K[styles/]
    A --> L[package.json]
    
    B --> B1[page.tsx]
    B --> B2[layout.tsx]
    B --> B3[signin/]
    B --> B4[signup/]
    B --> B5[favorites/]
    B --> B6[playlist/[id]/]
    
    C --> C1[AudioPlayer/]
    C --> C2[Bar/]
    C --> C3[CenterBlock/]
    C --> C4[Header/]
    C --> C5[Sidebar/]
    C --> C6[Track/]
    C --> C7[FilterList/]
    C --> C8[LoadingState/]
    
    D --> D1[store.ts]
    D --> D2[ReduxProvider.tsx]
    D --> D3[hooks.ts]
    D --> D4[features/]
    D4 --> D41[trackSlice.ts]
    
    E --> E1[client.ts]
    E --> E2[withReAuth.ts]
    
    F --> F1[api.ts]
    
    G --> G1[useFavorites.ts]
    G --> G2[usePlayerControls.ts]
    
    H --> H1[AuthContext.tsx]
    H --> H2[NotificationContext.tsx]
    
    I --> I1[formatters.ts]
    I --> I2[filters.ts]
    
    J --> J1[images/]
    J --> J2[fonts/]
    
    K --> K1[globals.css]

🔌 API документация

Базовый URL https://webdev-music-003b5b991590.herokuapp.com
