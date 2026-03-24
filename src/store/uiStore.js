import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export const useUiStore = create(
  persist(
    (set) => ({
      isSidebarCollapsed: false,
      theme: "light",
      toggleSidebar: () =>
        set((state) => ({
          isSidebarCollapsed: !state.isSidebarCollapsed,
        })),
      setTheme: (theme) => set({ theme }),
      toggleTheme: () =>
        set((state) => ({
          theme: state.theme === "light" ? "dark" : "light",
        })),
    }),
    {
      name: "ui-store",
      partialize: (state) => ({
        theme: state.theme,
        isSidebarCollapsed: state.isSidebarCollapsed,
      }),
      storage: createJSONStorage(() => localStorage),
    }
  )
);
