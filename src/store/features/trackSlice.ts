import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TrackType } from '@/types/track';

type InitialStateType = {
  currentTrack: TrackType | null;
  isPlaying: boolean;
};

const initialState: InitialStateType = {
  currentTrack: null,
  isPlaying: false,
};

const trackSlice = createSlice({
  name: 'tracks',
  initialState,
  reducers: {
    setCurrentTrack: (state, action: PayloadAction<TrackType>) => {
      state.currentTrack = action.payload;
      state.isPlaying = true;
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
  },
});

export const {
  setCurrentTrack,
  togglePlay,
  playTrack,
  pauseTrack,
} = trackSlice.actions;

export const trackSliceReducer = trackSlice.reducer;