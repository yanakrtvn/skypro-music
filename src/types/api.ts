export interface User {
  email: string;
  username: string;
  _id: number;
}

export interface AuthResponse {
  email: string;
  username: string;
  _id: number;
}

export interface TokenResponse {
  refresh: string;
  access: string;
}

export interface Track {
  _id: number;
  name: string;
  author: string;
  release_date: string;
  genre: string[];
  duration_in_seconds: number;
  album: string;
  logo: null | string;
  track_file: string;
  stared_user: string[];
}

export interface Playlist {
  _id: number;
  name: string;
  items: Track[];
  tracks?: Track[];
  description?: string;
  owner?: string;
  created_at?: string;
  success?: boolean;
  data?: Track[];
}

export interface APIError {
  message: string;
  success?: boolean;
  detail?: string;
  code?: string;
}

export interface FilterData {
  artists: string[];
  genres: string[];
  years: string[];
}