import axios from "axios";

import { API_ROUTES } from "@/constants/apiRoutes";
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

let isRefreshing = false;
let failedQueue = [];

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

axiosInstance.interceptors.request.use((config) => {
  const accessToken = useAuthStore.getState().accessToken;
  config.headers = config.headers ?? {};

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

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
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return axiosInstance(originalRequest);
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const refreshResponse = await axiosPublic.post(API_ROUTES.auth.refresh, null, {
        skipAuthRefresh: true,
      });
      const nextToken =
        refreshResponse.data?.data?.access_token ??
        refreshResponse.data?.data?.accessToken ??
        refreshResponse.data?.access_token;

      useAuthStore.getState().setAccessToken(nextToken);
      processQueue(null, nextToken);

      originalRequest.headers = originalRequest.headers ?? {};
      originalRequest.headers.Authorization = `Bearer ${nextToken}`;
      return axiosInstance(originalRequest);
    } catch (refreshError) {
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
