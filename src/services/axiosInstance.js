import axios from "axios";

import { API_ROUTES } from "@/constants/apiRoutes";
import { queryClient } from "@/lib/queryClient";
import { useAuthStore } from "@/store/authStore";

const defaultConfig = {
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
};

export const axiosPublic = axios.create(defaultConfig);
export const axiosInstance = axios.create(defaultConfig);

const axiosCsrf = axios.create(defaultConfig);

let isRefreshing = false;
let failedQueue = [];
let csrfTokenCache = null;
let csrfHeaderNameCache = "X-XSRF-TOKEN";
let csrfPromise = null;

export function resetCsrfToken() {
  csrfTokenCache = null;
  csrfHeaderNameCache = "X-XSRF-TOKEN";
  csrfPromise = null;
}

function shouldAttachCsrf(config) {
  const method = config.method?.toLowerCase() ?? "get";

  if (config.skipCsrf) {
    return false;
  }

  return !["get", "head", "options"].includes(method);
}

export async function ensureCsrfToken(options = {}) {
  const { forceRefresh = false } = options;

  if (forceRefresh) {
    resetCsrfToken();
  }

  if (csrfTokenCache) {
    return {
      token: csrfTokenCache,
      headerName: csrfHeaderNameCache,
    };
  }

  if (!csrfPromise) {
    csrfPromise = axiosCsrf
      .get(API_ROUTES.auth.csrf, {
        skipCsrf: true,
        skipAuthRefresh: true,
      })
      .then((response) => {
        const payload = response.data?.data ?? response.data ?? {};

        csrfTokenCache = payload?.token ?? null;
        csrfHeaderNameCache =
          payload?.header_name ?? payload?.headerName ?? "X-XSRF-TOKEN";

        return {
          token: csrfTokenCache,
          headerName: csrfHeaderNameCache,
        };
      })
      .finally(() => {
        csrfPromise = null;
      });
  }

  return csrfPromise;
}

function processQueue(error, token = null) {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
      return;
    }

    promise.resolve(token);
  });

  failedQueue = [];
}

async function applyRequestAuth(config, { withAuth }) {
  const accessToken = useAuthStore.getState().accessToken;
  config.headers = config.headers ?? {};

  if (withAuth && accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  if (shouldAttachCsrf(config)) {
    const csrf = await ensureCsrfToken();

    if (csrf?.token && csrf?.headerName) {
      config.headers[csrf.headerName] = csrf.token;
    }
  }

  return config;
}

axiosPublic.interceptors.request.use((config) =>
  applyRequestAuth(config, { withAuth: false })
);

axiosInstance.interceptors.request.use((config) =>
  applyRequestAuth(config, { withAuth: true })
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    const isRefreshRequest =
      originalRequest?.url?.includes(API_ROUTES.auth.refresh) ||
      originalRequest?.skipAuthRefresh;

    if (status !== 401 || isRefreshRequest || originalRequest?._retry) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then((token) => {
        originalRequest.headers = originalRequest.headers ?? {};
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return axiosInstance(originalRequest);
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      await ensureCsrfToken();

      const refreshResponse = await axiosPublic.post(API_ROUTES.auth.refresh, null, {
        skipAuthRefresh: true,
      });
      const refreshPayload = refreshResponse.data?.data ?? refreshResponse.data ?? {};
      const nextAccessToken =
        refreshPayload?.access_token ?? refreshPayload?.accessToken ?? null;

      if (!nextAccessToken) {
        throw new Error("Missing access token");
      }

      useAuthStore.getState().setAccessToken(nextAccessToken);
      processQueue(null, nextAccessToken);

      originalRequest.headers = originalRequest.headers ?? {};
      originalRequest.headers.Authorization = `Bearer ${nextAccessToken}`;
      return axiosInstance(originalRequest);
    } catch (refreshError) {
      queryClient.clear();
      useAuthStore.getState().clearAuth();
      processQueue(refreshError, null);

      if (window.location.pathname !== "/login") {
        window.location.assign("/login");
      }

      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);
