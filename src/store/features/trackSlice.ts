import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Track as ApiTrack } from '@/types/api';

type TrackType = ApiTrack;

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
  allTracks: TrackType[];
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
  allTracks: [],
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
      
      if (state.shuffle && action.payload.playlist.tracks.length > 0) {
        state.shuffledOrder = generateShuffledOrder(action.payload.playlist.tracks.length);
        
        const trackIndex = action.payload.playlist.tracks.findIndex(
          t => t._id === action.payload.track._id
        );
        
        if (trackIndex >= 0) {
          state.currentShuffleIndex = state.shuffledOrder.indexOf(trackIndex);
        } else {
          state.currentShuffleIndex = 0;
        }

      } else {
        state.shuffledOrder = [];
        state.currentShuffleIndex = -1;
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
      state.volume = Math.max(0, Math.min(1, action.payload));
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
          
          if (trackIndex >= 0) {
            state.currentShuffleIndex = state.shuffledOrder.indexOf(trackIndex);
          } else {
            state.currentShuffleIndex = 0;
          }
        } else {
          state.currentShuffleIndex = 0;
        }

      } else {
        state.shuffledOrder = [];
        state.currentShuffleIndex = -1;
      }
    },
    
    nextTrack: (state) => {
      
      if (!state.currentPlaylist || !state.currentTrack) {
        return;
      }
      
      const tracks = state.currentPlaylist.tracks;
      
      if (tracks.length === 0) {
        return;
      }
      
      if (state.shuffle && state.shuffledOrder.length > 0) {
        state.currentShuffleIndex++;

        if (state.currentShuffleIndex >= state.shuffledOrder.length) {
          state.shuffledOrder = generateShuffledOrder(tracks.length);
          state.currentShuffleIndex = 0;
        }
        
        const nextTrackIndex = state.shuffledOrder[state.currentShuffleIndex];
        
        if (tracks[nextTrackIndex]) {
          state.currentTrack = tracks[nextTrackIndex];
        } else {
          state.currentTrack = tracks[0];
        }
      } else {
        const currentIndex = tracks.findIndex(t => t._id === state.currentTrack!._id);

        let nextIndex;
        if (currentIndex === -1) {
          nextIndex = 0;
        } else {
          nextIndex = (currentIndex + 1) % tracks.length;
        }

        if (tracks[nextIndex]) {
          state.currentTrack = tracks[nextIndex];
        } else if (tracks.length > 0) {
          state.currentTrack = tracks[0];
        }
      }

      state.currentTime = 0;
      state.isPlaying = true;

    },
    
    prevTrack: (state) => {
      if (!state.currentPlaylist || !state.currentTrack) {
        return;
      }
      
      const tracks = state.currentPlaylist.tracks;
      
      if (tracks.length === 0) {
        return;
      }
      
      if (state.shuffle && state.shuffledOrder.length > 0) {

        state.currentShuffleIndex--;

        if (state.currentShuffleIndex < 0) {
          state.shuffledOrder = generateShuffledOrder(tracks.length);
          state.currentShuffleIndex = state.shuffledOrder.length - 1;
        }
        
        const prevTrackIndex = state.shuffledOrder[state.currentShuffleIndex];
        
        if (tracks[prevTrackIndex]) {
          state.currentTrack = tracks[prevTrackIndex];
        } else {
          state.currentTrack = tracks[tracks.length - 1];
        }
      } else {
        const currentIndex = tracks.findIndex(t => t._id === state.currentTrack!._id);
        
        let prevIndex;
        if (currentIndex === -1) {
          prevIndex = tracks.length - 1;
        } else if (currentIndex === 0) {
          prevIndex = tracks.length - 1;
        } else {
          prevIndex = currentIndex - 1;
        }
        
        
        if (tracks[prevIndex]) {
          state.currentTrack = tracks[prevIndex];
        } else if (tracks.length > 0) {
          state.currentTrack = tracks[tracks.length - 1];
        }
      }
      
      state.currentTime = 0;
      state.isPlaying = true;
      
      console.log('New current track:', state.currentTrack?.name);
    },
    
    seekToTime: (state, action: PayloadAction<number>) => {
      state.currentTime = Math.min(Math.max(0, action.payload), state.duration);
    },

    setPlaylistTracks: (state, action: PayloadAction<TrackType[]>) => {
      console.log('Setting playlist tracks, count:', action.payload.length);
      
      if (state.currentPlaylist) {
        state.currentPlaylist.tracks = action.payload;
      }

      state.allTracks = action.payload;

      if (!state.currentTrack && action.payload.length > 0) {
        state.currentTrack = action.payload[0];
      }
    },

    setSpecificPlaylist: (state, action: PayloadAction<{id: number, name: string, tracks: TrackType[]}>) => {
      console.log('Setting specific playlist:', action.payload.name, 'with', action.payload.tracks.length, 'tracks');
      
      state.currentPlaylist = {
        id: action.payload.id,
        name: action.payload.name,
        tracks: action.payload.tracks
      };

      if (!state.currentTrack && action.payload.tracks.length > 0) {
        state.currentTrack = action.payload.tracks[0];
      }

      if (state.shuffle) {
        state.shuffledOrder = generateShuffledOrder(action.payload.tracks.length);
        state.currentShuffleIndex = 0;
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
  setSpecificPlaylist,
} = trackSlice.actions;

export const trackSliceReducer = trackSlice.reducer;