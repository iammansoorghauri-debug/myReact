// src/stores/appSlice.ts
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Profile } from '../lib/fakeDB';
import { fakeDB } from '../lib/fakeDB';
import { logoutUser } from '../actions/auth';

const initialState = {
    activeSession: null as Profile | null,
    profiles: [] as Profile[],
    onScreenLogs: [] as string[],
    totalClicks: 0,
};

const appSlice = createSlice({
    name: 'app',
    initialState,
    reducers: {
        setInitialData: (state, action: PayloadAction<{ session: Profile | null; profilesList: Profile[] }>) => {
            // Clone instead of storing the same object references as fakeDB.
            // Otherwise Immer's auto-freeze (dev mode) freezes fakeDB's objects too,
            // and later direct mutations like `dbProfile.isOnline = ...` throw.
            state.activeSession = action.payload.session ? { ...action.payload.session } : null;
            state.profiles = action.payload.profilesList.map((p) => ({ ...p }));
        },

        pushLog: (state, action: PayloadAction<string>) => {
        // RTK uses Immer: We can push directly into the array without copying it!
            state.onScreenLogs.push(action.payload);
        },

        handleLogout: (state) => {
            logoutUser();
            state.activeSession = null;
            state.onScreenLogs.push("[AUTH]: Active session terminated. Redirecting to gateway...");
        },

        handleRegisterUser: (state, action: PayloadAction<Profile>) => {
            state.profiles.push(action.payload);
            state.activeSession = action.payload;
            state.onScreenLogs.push(`[REGISTER SUCCESS]: Added "${action.payload.username}" to the core database.`);
        },

        handleToggleStatus: (state, action: PayloadAction<string>) => {
            const id = action.payload;

            const profile = state.profiles.find((p) => p.id === id);
            if (profile)
                profile.isOnline = !profile.isOnline;

            // Note: Mutating the fakeDB here keeps parity with your old code,
            // but in real RTK apps, side-effects like DB calls are handled outside reducers.
            const dbProfile = fakeDB.profiles.find((p) => p.id === id);
            if (dbProfile)
                dbProfile.isOnline = !dbProfile.isOnline;
            
            state.onScreenLogs.push(`[UPDATE]: Toggled online status.`);
        },

        handleDeleteUser: (state, action: PayloadAction<{ id: string; name: string }>) => {
            const { id, name } = action.payload;
            
            fakeDB.profiles = fakeDB.profiles.filter((p) => p.id !== id);
            state.profiles = state.profiles.filter((p) => p.id !== id);
            
            state.onScreenLogs.push(`[DELETE]: Erased "${name}" from the database.`);

            if (state.activeSession && state.activeSession.username === name) {
                state.activeSession = null;
                state.onScreenLogs.push("[AUTH]: Active session terminated because profile was deleted.");
            }
        },
        incrementClicks: (state) => {
            state.totalClicks += 1;
        },
        syncProfilesAfterPing: (state, action: PayloadAction<string>) => {
            const profile = state.profiles.find((p) => p.id === action.payload);
            if (profile)
                profile.messagesSent += 1;
        }
    }
});

// Export the actions to be dispatched by components
export const {
    setInitialData,
    pushLog,
    handleLogout,
    handleRegisterUser,
    handleToggleStatus,
    handleDeleteUser,
    incrementClicks,
    syncProfilesAfterPing
} = appSlice.actions;

// Export the reducer to wire into the master store
export default appSlice.reducer;