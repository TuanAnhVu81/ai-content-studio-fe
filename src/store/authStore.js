import { create } from "zustand";

export const useAuthStore = create((set) => ({
  accessToken: null,
  user: null,
  setAccessToken: (accessToken) => set({ accessToken }),
  setUser: (user) => set({ user }),
  clearAuth: () =>
    set({
      accessToken: null,
      user: null,
    }),
}));
