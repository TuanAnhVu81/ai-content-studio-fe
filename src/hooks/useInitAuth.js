import { useEffect, useRef, useState } from "react";

import { authService } from "@/services/authService";
import { useAuthStore } from "@/store/authStore";

export function useInitAuth() {
  const [isInitializing, setIsInitializing] = useState(true);
  const hasInitializedRef = useRef(false);
  const setAccessToken = useAuthStore((state) => state.setAccessToken);
  const setUser = useAuthStore((state) => state.setUser);
  const clearAuth = useAuthStore((state) => state.clearAuth);

  useEffect(() => {
    if (hasInitializedRef.current) {
      return undefined;
    }

    hasInitializedRef.current = true;

    const currentPath = window.location.pathname;
    const isPublicAuthPage =
      currentPath === "/login" || currentPath === "/register";

    if (isPublicAuthPage) {
      setIsInitializing(false);
      return undefined;
    }

    const initializeAuth = async () => {
      try {
        const refreshResponse = await authService.refresh();
        const nextToken =
          refreshResponse?.data?.access_token ??
          refreshResponse?.data?.accessToken ??
          refreshResponse?.access_token ??
          null;

        if (!nextToken) {
          clearAuth();
          return;
        }

        setAccessToken(nextToken);

        const currentUser = await authService.getMe();
        setUser(currentUser);
      } catch (error) {
        clearAuth();
      } finally {
        setIsInitializing(false);
      }
    };

    initializeAuth();
  }, [clearAuth, setAccessToken, setUser]);

  return { isInitializing };
}
