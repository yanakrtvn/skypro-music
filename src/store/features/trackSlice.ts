import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TrackType } from '@/types/track';

type PlaylistType = {
  id: number;
  name: string;
  tracks: TrackType[];
};

type InitialStateType = {
  currentTrack: TrackType | null;
  isPlaying: boolean;
  volume: number;
  duration: number;
  currentTime: number;
  loop: boolean;
  shuffle: boolean;
  shuffledOrder: number[];
  currentShuffleIndex: number;
  currentPlaylist: PlaylistType | null;
};

const initialState: InitialStateType = {
  currentTrack: null,
  isPlaying: false,
  volume: 0.5,
  duration: 0,
  currentTime: 0,
  loop: false,
  shuffle: false,
  shuffledOrder: [],
  currentShuffleIndex: -1,
  currentPlaylist: {
    id: 1,
    name: 'Главное',
    tracks: [],
  },
};

const trackSlice = createSlice({
  name: 'tracks',
  initialState,
  reducers: {
    setCurrentTrack: (state, action: PayloadAction<{track: TrackType, playlist: PlaylistType}>) => {
      state.currentTrack = action.payload.track;
      state.currentPlaylist = action.payload.playlist;
      state.currentTime = 0;
      state.isPlaying = true;
      
      if (state.shuffle) {
        state.shuffledOrder = generateShuffledOrder(action.payload.playlist.tracks.length);
        const trackIndex = action.payload.playlist.tracks.findIndex(
          t => t._id === action.payload.track._id
        );
        state.currentShuffleIndex = state.shuffledOrder.indexOf(trackIndex);
      }
    },
    
    togglePlay: (state) => {
      state.isPlaying = !state.isPlaying;
    },
    
    playTrack: (state) => {
      state.isPlaying = true;
    },
    
    pauseTrack: (state) => {
      state.isPlaying = false;
    },
    
    setVolume: (state, action: PayloadAction<number>) => {
      state.volume = action.payload;
    },
    
    setDuration: (state, action: PayloadAction<number>) => {
      state.duration = action.payload;
    },
    
    setCurrentTime: (state, action: PayloadAction<number>) => {
      state.currentTime = action.payload;
    },
    
    setLoop: (state, action: PayloadAction<boolean>) => {
      state.loop = action.payload;
    },
    
    setShuffle: (state, action: PayloadAction<boolean>) => {
      state.shuffle = action.payload;
      if (action.payload && state.currentPlaylist) {
        state.shuffledOrder = generateShuffledOrder(state.currentPlaylist.tracks.length);
        if (state.currentTrack) {
          const trackIndex = state.currentPlaylist.tracks.findIndex(
            t => t._id === state.currentTrack!._id
          );
          state.currentShuffleIndex = state.shuffledOrder.indexOf(trackIndex);
        }
      } else {
        state.shuffledOrder = [];
        state.currentShuffleIndex = -1;
      }
    },
    
    nextTrack: (state) => {
      if (!state.currentPlaylist || !state.currentTrack) return;
      
      const tracks = state.currentPlaylist.tracks;
      let nextIndex: number;
      
      if (state.shuffle && state.shuffledOrder.length > 0) {
        nextIndex = state.currentShuffleIndex + 1;
        if (nextIndex >= state.shuffledOrder.length) return;
        const trackIndex = state.shuffledOrder[nextIndex];
        state.currentTrack = tracks[trackIndex];
        state.currentShuffleIndex = nextIndex;
      } else {
        const currentIndex = tracks.findIndex(t => t._id === state.currentTrack!._id);
        if (currentIndex === -1 || currentIndex >= tracks.length - 1) return;
        state.currentTrack = tracks[currentIndex + 1];
      }
      
      state.currentTime = 0;
      state.isPlaying = true;
    },
    
    prevTrack: (state) => {
      if (!state.currentPlaylist || !state.currentTrack) return;
      
      const tracks = state.currentPlaylist.tracks;
      let prevIndex: number;
      
      if (state.shuffle && state.shuffledOrder.length > 0) {
        prevIndex = state.currentShuffleIndex - 1;
        if (prevIndex < 0) return;
        const trackIndex = state.shuffledOrder[prevIndex];
        state.currentTrack = tracks[trackIndex];
        state.currentShuffleIndex = prevIndex;
      } else {
        const currentIndex = tracks.findIndex(t => t._id === state.currentTrack!._id);
        if (currentIndex <= 0) return;
        state.currentTrack = tracks[currentIndex - 1];
      }
      
      state.currentTime = 0;
      state.isPlaying = true;
    },
    
    seekToTime: (state, action: PayloadAction<number>) => {
      state.currentTime = Math.min(Math.max(0, action.payload), state.duration);
    },
    
    setPlaylistTracks: (state, action: PayloadAction<TrackType[]>) => {
      if (state.currentPlaylist) {
        state.currentPlaylist.tracks = action.payload;
      }
    },
  },
});

function generateShuffledOrder(length: number): number[] {
  const order = Array.from({ length }, (_, i) => i);
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return order;
}

export const {
  setCurrentTrack,
  togglePlay,
  playTrack,
  pauseTrack,
  setVolume,
  setDuration,
  setCurrentTime,
  setLoop,
  setShuffle,
  nextTrack,
  prevTrack,
  seekToTime,
  setPlaylistTracks,
} = trackSlice.actions;

export const trackSliceReducer = trackSlice.reducer;