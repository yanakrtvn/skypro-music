import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Track as ApiTrack, FavoriteTracksResponse } from '@/types/api';

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
  playlistTracks: TrackType[];
  favoriteTracks: TrackType[];
  favoriteTrackIds: number[];
  isFavoritesLoading: boolean;
};

const initialState: InitialStateType = {
  currentTrack: null,
  isPlaying: false,
  volume: 0.5,
  duration: 0,
  currentTime: 0,
  loop: false,
  shuffle: false,
  playlistTracks: [],
  shuffledOrder: [],
  currentShuffleIndex: -1,
  currentPlaylist: {
    id: 1,
    name: 'Главное',
    tracks: [],
  },
  allTracks: [],
  favoriteTracks: [],
  favoriteTrackIds: [],
  isFavoritesLoading: false,
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
      
    },
    
    seekToTime: (state, action: PayloadAction<number>) => {
      state.currentTime = Math.min(Math.max(0, action.payload), state.duration);
    },

setPlaylistTracks: (state, action: PayloadAction<TrackType[]>) => {
  const sortedTracks = [...action.payload].sort((a, b) => {
    if (!a.release_date || !b.release_date) return 0;
    
    const dateA = new Date(a.release_date).getTime();
    const dateB = new Date(b.release_date).getTime();
    return dateB - dateA; 
  });
  
  state.playlistTracks = sortedTracks;
  
  if (state.currentPlaylist) {
    state.currentPlaylist.tracks = sortedTracks;
  }

  state.allTracks = sortedTracks;

  if (!state.currentTrack && sortedTracks.length > 0) {
    state.currentTrack = sortedTracks[0];
  }
},

setSpecificPlaylist: (state, action: PayloadAction<{id: number, name: string, tracks: TrackType[]}>) => {
  const sortedTracks = [...action.payload.tracks].sort((a, b) => {
    if (!a.release_date || !b.release_date) return 0;
    
    const dateA = new Date(a.release_date).getTime();
    const dateB = new Date(b.release_date).getTime();
    return dateB - dateA;
  });
  
  state.currentPlaylist = {
    id: action.payload.id,
    name: action.payload.name,
    tracks: sortedTracks
  };

  if (!state.currentTrack && sortedTracks.length > 0) {
    state.currentTrack = sortedTracks[0];
  }

  if (state.shuffle) {
    state.shuffledOrder = generateShuffledOrder(sortedTracks.length);
    state.currentShuffleIndex = 0;
  }
},

setFavoriteTracks: (state, action: PayloadAction<TrackType[] | FavoriteTracksResponse>) => {
  try {
    let tracksArray: TrackType[] = [];

    if (Array.isArray(action.payload)) {
      tracksArray = action.payload;
    } else if (action.payload && typeof action.payload === 'object') {
      const response = action.payload as FavoriteTracksResponse;
      if (Array.isArray(response.data)) {
        tracksArray = response.data;
      } else if (Array.isArray(response.result)) {
        tracksArray = response.result;
      } else if (Array.isArray(response.tracks)) {
        tracksArray = response.tracks;
      } else if (Array.isArray(response.items)) {
        tracksArray = response.items;
      }
    }

    const validTracks = tracksArray.filter((track): track is TrackType => 
      track && typeof track === 'object' && track._id !== undefined
    );
    
    const sortedTracks = validTracks.sort((a, b) => {
      if (!a.release_date || !b.release_date) return 0;
      
      const dateA = new Date(a.release_date).getTime();
      const dateB = new Date(b.release_date).getTime();
      return dateB - dateA;
    });
    
    state.favoriteTracks = sortedTracks;
    state.favoriteTrackIds = sortedTracks.map(track => track._id);
    state.isFavoritesLoading = false;
    
  } catch (error) {
    console.error('Ошибка в setFavoriteTracks:', error, action.payload);
    state.favoriteTracks = [];
    state.favoriteTrackIds = [];
    state.isFavoritesLoading = false;
  }
},
    
    addToFavorites: (state, action: PayloadAction<TrackType>) => {
      const track = action.payload;
      if (!state.favoriteTrackIds.includes(track._id)) {
        state.favoriteTracks.push(track);
        state.favoriteTrackIds.push(track._id);
        
        if (state.allTracks.length > 0) {
          const trackIndex = state.allTracks.findIndex(t => t._id === track._id);
          if (trackIndex !== -1) {
            const updatedTrack = { ...state.allTracks[trackIndex] };
            if (!updatedTrack.stared_user) {
              updatedTrack.stared_user = [];
            }

            if (!updatedTrack.stared_user.includes('current_user')) {
              updatedTrack.stared_user.push('current_user');
            }
            state.allTracks[trackIndex] = updatedTrack;
          }
        }
      }
    },
    
    removeFromFavorites: (state, action: PayloadAction<number>) => {
      const trackId = action.payload;
      state.favoriteTracks = state.favoriteTracks.filter(track => track._id !== trackId);
      state.favoriteTrackIds = state.favoriteTrackIds.filter(id => id !== trackId);

      if (state.allTracks.length > 0) {
        const trackIndex = state.allTracks.findIndex(t => t._id === trackId);
        if (trackIndex !== -1) {
          const updatedTrack = { ...state.allTracks[trackIndex] };
          if (updatedTrack.stared_user) {
            updatedTrack.stared_user = updatedTrack.stared_user.filter(user => user !== 'current_user');
          }
          state.allTracks[trackIndex] = updatedTrack;
        }
      }
    },
    
    setFavoritesLoading: (state, action: PayloadAction<boolean>) => {
      state.isFavoritesLoading = action.payload;
    },
    
    clearFavorites: (state) => {
      state.favoriteTracks = [];
      state.favoriteTrackIds = [];
    }
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
  setFavoriteTracks,
  addToFavorites,
  removeFromFavorites,
  setFavoritesLoading,
  clearFavorites,
} = trackSlice.actions;

export const trackSliceReducer = trackSlice.reducer;