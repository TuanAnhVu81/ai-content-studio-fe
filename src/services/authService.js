import { API_ROUTES } from "@/constants/apiRoutes";
import {
  axiosInstance,
  axiosPublic,
  ensureCsrfToken,
  resetCsrfToken,
} from "@/services/axiosInstance";

function unwrapPayload(payload) {
  return payload?.data ?? payload ?? {};
}

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

function normalizeAuthSession(payload) {
  const data = unwrapPayload(payload);

  return {
    access_token: data?.access_token ?? data?.accessToken ?? null,
    token_type: data?.token_type ?? data?.tokenType ?? "Bearer",
    user: normalizeUser(data?.user),
  };
}

export const authService = {
  async register(payload) {
    const response = await axiosPublic.post(API_ROUTES.auth.register, payload);
    return response.data;
  },
  async login(payload) {
    await ensureCsrfToken({ forceRefresh: true });
    const response = await axiosPublic.post(API_ROUTES.auth.login, payload);
    return normalizeAuthSession(response.data);
  },
  async refresh() {
    await ensureCsrfToken();
    const response = await axiosPublic.post(API_ROUTES.auth.refresh, null, {
      skipAuthRefresh: true,
    });
    return normalizeAuthSession(response.data);
  },
  async logout() {
    await ensureCsrfToken({ forceRefresh: true });
    const response = await axiosInstance.post(API_ROUTES.auth.logout);
    resetCsrfToken();
    return response.data;
  },
  async changePassword(payload) {
    await ensureCsrfToken();
    const response = await axiosInstance.patch(API_ROUTES.auth.changePassword, payload);
    return response.data;
  },
  async getMe() {
    const response = await axiosInstance.get(API_ROUTES.auth.me);
    return normalizeUser(response.data?.data ?? response.data);
  },
};
