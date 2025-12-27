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
    
    if (state.currentShuffleIndex === -1) {
      state.currentShuffleIndex = 0;
    }
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
  if (action.payload && state.currentPlaylist && state.currentPlaylist.tracks.length > 0) {
    state.shuffledOrder = generateShuffledOrder(state.currentPlaylist.tracks.length);
    
    if (state.currentTrack) {
      const trackIndex = state.currentPlaylist.tracks.findIndex(
        t => t._id === state.currentTrack!._id
      );
      state.currentShuffleIndex = state.shuffledOrder.indexOf(trackIndex);
      
      if (state.currentShuffleIndex === -1) {
        state.currentShuffleIndex = 0;
      }
    }
  } else {
    state.shuffledOrder = [];
    state.currentShuffleIndex = -1;
  }
},
    
    nextTrack: (state) => {
  if (!state.currentPlaylist || !state.currentTrack) return;
  
  const tracks = state.currentPlaylist.tracks;
  if (tracks.length === 0) return;
  
  if (state.shuffle) {
    if (state.shuffledOrder.length === 0) {
      state.shuffledOrder = generateShuffledOrder(tracks.length);
      state.currentShuffleIndex = 0;
    } else {
      state.currentShuffleIndex++;
      
      if (state.currentShuffleIndex >= state.shuffledOrder.length) {
        state.shuffledOrder = generateShuffledOrder(tracks.length);
        state.currentShuffleIndex = 0;
      }
    }
    
    const trackIndex = state.shuffledOrder[state.currentShuffleIndex];
    state.currentTrack = tracks[trackIndex];
  } else {
    const currentIndex = tracks.findIndex(t => t._id === state.currentTrack!._id);
    const nextIndex = (currentIndex + 1) % tracks.length;
    state.currentTrack = tracks[nextIndex];
  }
  
  state.currentTime = 0;
  state.isPlaying = true;
},

prevTrack: (state) => {
  if (!state.currentPlaylist || !state.currentTrack) return;
  
  const tracks = state.currentPlaylist.tracks;
  if (tracks.length === 0) return;
  
  if (state.shuffle) {
    if (state.shuffledOrder.length === 0) {
      state.shuffledOrder = generateShuffledOrder(tracks.length);
      state.currentShuffleIndex = state.shuffledOrder.length - 1;
    } else {
      state.currentShuffleIndex--;
      
      if (state.currentShuffleIndex < 0) {
        state.shuffledOrder = generateShuffledOrder(tracks.length);
        state.currentShuffleIndex = state.shuffledOrder.length - 1;
      }
    }
    
    const trackIndex = state.shuffledOrder[state.currentShuffleIndex];
    state.currentTrack = tracks[trackIndex];
  } else {
    const currentIndex = tracks.findIndex(t => t._id === state.currentTrack!._id);
    const prevIndex = currentIndex <= 0 ? tracks.length - 1 : currentIndex - 1;
    state.currentTrack = tracks[prevIndex];
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