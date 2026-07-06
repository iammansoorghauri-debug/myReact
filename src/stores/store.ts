// src/stores/store.ts
import { configureStore } from '@reduxjs/toolkit';
import appReducer from './appSlice';

export const store = configureStore({
    reducer: {
        app: appReducer, // Maps the appSlice to the "app" compartment
    },
});

// Create explicit TypeScript types for the Redux infrastructure
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
