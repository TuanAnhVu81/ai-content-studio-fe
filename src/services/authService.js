import { API_ROUTES } from "@/constants/apiRoutes";
import { axiosInstance, axiosPublic } from "@/services/axiosInstance";

function normalizeUser(user) {
  if (!user) {
    return null;
  }

  const rawRoles = Array.isArray(user.roles) ? user.roles : [];

  return {
    ...user,
    full_name: user.full_name ?? user.fullName ?? "",
    roles: rawRoles.map((role) => (typeof role === "string" ? role : role?.name)).filter(Boolean),
  };
}

export const authService = {
  async register(payload) {
    const response = await axiosPublic.post(API_ROUTES.auth.register, payload);
    return response.data;
  },
  async login(payload) {
    const response = await axiosPublic.post(API_ROUTES.auth.login, payload);
    return response.data;
  },
  async refresh(refreshToken) {
    const response = await axiosPublic.post(
      API_ROUTES.auth.refresh,
      refreshToken ? { refresh_token: refreshToken } : null,
      {
        skipAuthRefresh: true,
      }
    );
    // Unwrap envelope: backend returns { status, data: { accessToken, refreshToken }, message }
    return response.data?.data ?? response.data;
  },
  async logout(refreshToken) {
    const response = await axiosInstance.post(API_ROUTES.auth.logout, {
      refresh_token: refreshToken,
    });
    return response.data;
  },
  async changePassword(payload) {
    const response = await axiosInstance.patch(API_ROUTES.auth.changePassword, payload);
    return response.data;
  },
  async getMe() {
    const response = await axiosInstance.get(API_ROUTES.auth.me);
    return normalizeUser(response.data?.data ?? response.data);
  },
};
