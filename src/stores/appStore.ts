// src/stores/appStore.ts
import { create } from 'zustand';
import type { Profile } from '../lib/fakeDB';
import { fakeDB } from '../lib/fakeDB';
import { logoutUser } from '../actions/auth';


// Reuse your exact type blueprint for state configuration
type AppStore = {
    activeSession: Profile | null;
    profiles: Profile[];
    onScreenLogs: string[];
    totalClicks: number;


    // Actions
    setInitialData: (session: Profile | null, profilesList: Profile[]) => void;
    pushLog: (text: string) => void;
    handleLogout: () => void;
    handleRegisterUser: (newProfile: Profile) => void;
    handleToggleStatus: (id: string) => void;
    handleDeleteUser: (id: string, name: string) => void;
    incrementClicks: () => void;
    syncProfilesAfterPing: (id: string) => void;
};


export const useAppStore = create<AppStore>((set) => ({
    // --- STATE ---
    activeSession: null,
    profiles: [],
    onScreenLogs: [],
    totalClicks: 0,


    // --- ACTIONS ---
    setInitialData: (session, profilesList) =>
        set({ activeSession: session, profiles: profilesList }),


    pushLog: (text) =>
        set((state) => ({ onScreenLogs: [...state.onScreenLogs, text] })),

    handleLogout: () => {
        logoutUser();
        set((state) => ({
        activeSession: null,
        onScreenLogs: [...state.onScreenLogs, "[AUTH]: Active session terminated. Redirecting to gateway..."]
        }));
    },


    handleRegisterUser: (newProfile) =>
        set((state) => ({
        profiles: [...state.profiles, newProfile],
        activeSession: newProfile,
        onScreenLogs: [...state.onScreenLogs, `[REGISTER SUCCESS]: Added "${newProfile.username}" to the core database state array.`]
        })),

    handleToggleStatus: (id) =>
        set((state) => {
        const dbProfile = fakeDB.profiles.find((p) => p.id === id);
        if (dbProfile)
            dbProfile.isOnline = !dbProfile.isOnline;

        return {
            profiles: state.profiles.map((p) => p.id === id ? { ...p, isOnline: !p.isOnline } : p),
            onScreenLogs: [...state.onScreenLogs, `[UPDATE]: Toggled online status.`]
        };
        }),

    handleDeleteUser: (id, name) =>
        set((state) => {
        fakeDB.profiles = fakeDB.profiles.filter((p) => p.id !== id);
        const filteredProfiles = state.profiles.filter((p) => p.id !== id);
        let nextSession = state.activeSession;
        let logs = [...state.onScreenLogs, `[DELETE]: Erased "${name}" from the database.`];

        if (state.activeSession && state.activeSession.username === name) {
            nextSession = null;
            logs.push("[AUTH]: Active session terminated because profile was deleted.");
        }

        return {
            profiles: filteredProfiles,
            activeSession: nextSession,
            onScreenLogs: logs
        };
        }),

    incrementClicks: () =>
        set((state) => ({ totalClicks: state.totalClicks + 1 })),

    syncProfilesAfterPing: (id) =>
        set((state) => ({
        profiles: state.profiles.map((p) =>
            p.id === id ? { ...p, messagesSent: p.messagesSent + 1 } : p
        )
        }))
}));