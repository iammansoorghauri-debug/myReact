// src/stores/appSlice.ts
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Profile } from "../lib/fakeDB";
import { logoutUser } from "../features/auth/actions/auth";

const initialState = {
  activeSession: null as Profile | null,
  profiles: [] as Profile[],
  onScreenLogs: [] as string[],
  totalClicks: 0,
};

const appSlice = createSlice({
  name: "app",
  initialState,
  reducers: {
    setInitialData: (
      state,
      action: PayloadAction<{
        session: Profile | null;
        profilesList: Profile[];
      }>
    ) => {
      // ✅ Updates client memory directly with what came from MongoDB
      state.activeSession = action.payload.session
        ? { ...action.payload.session }
        : null;
      state.profiles = action.payload.profilesList.map((p) => ({ ...p }));
    },

    pushLog: (state, action: PayloadAction<string>) => {
      state.onScreenLogs.push(action.payload);
    },

    handleLogout: (state) => {
      logoutUser();
      state.activeSession = null;
      state.onScreenLogs.push(
        "[AUTH]: Active session terminated. Redirecting to gateway..."
      );
    },

    handleRegisterUser: (state, action: PayloadAction<Profile>) => {
      state.profiles.push(action.payload);
      state.activeSession = action.payload;
      state.onScreenLogs.push(
        `[REGISTER SUCCESS]: Added "${action.payload.username}" to the core database.`
      );
    },

    // 💡 Note: handleToggleStatus and handleDeleteUser are now fallback store synchronizers,
    // since the live fetch hooks inside your ProfileDetail page handle the direct DB updates!
    handleToggleStatus: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      const profile = state.profiles.find((p) => p.id === id);
      if (profile) {
        profile.isOnline = !profile.isOnline;
      }
      state.onScreenLogs.push(`[UPDATE]: Syncing state online toggle layout.`);
    },

    handleDeleteUser: (
      state,
      action: PayloadAction<{ id: string; name: string }>
    ) => {
      const { id, name } = action.payload;

      state.profiles = state.profiles.filter((p) => p.id !== id);
      state.onScreenLogs.push(
        `[DELETE]: Erased "${name}" from client layout mapping.`
      );

      if (state.activeSession && state.activeSession.username === name) {
        state.activeSession = null;
        state.onScreenLogs.push(
          "[AUTH]: Active session terminated because profile was deleted."
        );
      }
    },

    incrementClicks: (state) => {
      state.totalClicks += 1;
    },

    syncProfilesAfterPing: (state, action: PayloadAction<string>) => {
      const profile = state.profiles.find((p) => p.id === action.payload);
      if (profile) {
        profile.messagesSent += 1;
      }
    },
  },
});

export const {
  setInitialData,
  pushLog,
  handleLogout,
  handleRegisterUser,
  handleToggleStatus,
  handleDeleteUser,
  incrementClicks,
  syncProfilesAfterPing,
} = appSlice.actions;

export default appSlice.reducer;
