import { configureStore } from '@reduxjs/toolkit';
import producersReducer from './slices/producersSlice';

export const store = configureStore({
  reducer: {
    producers: producersReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
