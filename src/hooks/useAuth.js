import { useMemo } from "react";

import { useAuthStore } from "@/store/authStore";

export function useAuth() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const user = useAuthStore((state) => state.user);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const setAccessToken = useAuthStore((state) => state.setAccessToken);
  const setRefreshToken = useAuthStore((state) => state.setRefreshToken);
  const setUser = useAuthStore((state) => state.setUser);

  return useMemo(
    () => ({
      accessToken,
      user,
      clearAuth,
      setAccessToken,
      setRefreshToken,
      setUser,
      isAuthenticated: Boolean(accessToken),
      isAdmin: user?.roles?.includes("ROLE_ADMIN") ?? false,
    }),
    [accessToken, clearAuth, setAccessToken, setRefreshToken, setUser, user]
  );
}
