import { useEffect, useRef, useState } from "react";

import { authService } from "@/services/authService";
import { useAuthStore } from "@/store/authStore";

export function useInitAuth() {
  const [isInitializing, setIsInitializing] = useState(true);
  const hasInitializedRef = useRef(false);

  useEffect(() => {
    if (hasInitializedRef.current) {
      return undefined;
    }

    const runInit = () => {
      hasInitializedRef.current = true;

      const currentPath = window.location.pathname;
      const isPublicAuthPage =
        currentPath === "/login" || currentPath === "/register";

      if (isPublicAuthPage) {
        setIsInitializing(false);
        return;
      }

      const initializeAuth = async () => {
        const { refreshToken, setAccessToken, setRefreshToken, setUser, clearAuth } =
          useAuthStore.getState();

        if (!refreshToken) {
          // No token in localStorage — user is not authenticated
          clearAuth();
          setIsInitializing(false);
          return;
        }

        try {
          const refreshResponse = await authService.refresh(refreshToken);

          // authService.refresh() returns the unwrapped { accessToken, refreshToken } payload
          const nextAccessToken =
            refreshResponse?.accessToken ?? refreshResponse?.access_token ?? null;
          const nextRefreshToken =
            refreshResponse?.refreshToken ?? refreshResponse?.refresh_token ?? null;

          if (!nextAccessToken) {
            clearAuth();
            return;
          }

          setAccessToken(nextAccessToken);

          if (nextRefreshToken) {
            setRefreshToken(nextRefreshToken);
          }

          const currentUser = await authService.getMe();
          setUser(currentUser);
        } catch (error) {
          clearAuth();
        } finally {
          setIsInitializing(false);
        }
      };

      initializeAuth();
    };

    // Wait for Zustand persist to finish re-hydrating from localStorage before reading tokens.
    // Without this guard, getState().refreshToken is always null on first render
    // even if a valid token exists in localStorage, causing a false logout on every reload.
    if (useAuthStore.persist.hasHydrated()) {
      runInit();
    } else {
      const unsub = useAuthStore.persist.onFinishHydration(() => {
        unsub();
        runInit();
      });
    }
  }, []);

  return { isInitializing };
}
