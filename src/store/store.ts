import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { trackSliceReducer } from './features/trackSlice';

export const makeStore = () => {
  return configureStore({
    reducer: combineReducers({
      tracks: trackSliceReducer,
    }),
  });
};


export type AppStore = ReturnType<typeof makeStore>;

type RootState = ReturnType<AppStore['getState']>;
type AppDispatch = AppStore['dispatch'];

export { type RootState, type AppDispatch };