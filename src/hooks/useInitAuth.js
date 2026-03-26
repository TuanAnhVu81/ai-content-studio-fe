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
      const publicPaths = new Set(["/", "/login", "/register"]);
      const isPublicAuthPage = publicPaths.has(currentPath);

      if (isPublicAuthPage) {
        setIsInitializing(false);
        return;
      }

      const initializeAuth = async () => {
        const { setAccessToken, setUser, clearAuth } = useAuthStore.getState();

        try {
          const refreshResponse = await authService.refresh();
          const nextAccessToken =
            refreshResponse?.accessToken ?? refreshResponse?.access_token ?? null;

          if (!nextAccessToken) {
            clearAuth();
            return;
          }

          setAccessToken(nextAccessToken);
          setUser(refreshResponse?.user ?? (await authService.getMe()));
        } catch (error) {
          clearAuth();
        } finally {
          setIsInitializing(false);
        }
      };

      initializeAuth();
    };

    // Wait for Zustand persist bootstrapping before auth init starts.
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
