import { API_ROUTES } from "@/constants/apiRoutes";
import { axiosInstance, axiosPublic } from "@/services/axiosInstance";

export const authService = {
  async register(payload) {
    const response = await axiosPublic.post(API_ROUTES.auth.register, payload);
    return response.data;
  },
  async login(payload) {
    const response = await axiosPublic.post(API_ROUTES.auth.login, payload);
    return response.data;
  },
  async refresh() {
    const response = await axiosPublic.post(API_ROUTES.auth.refresh, null, {
      skipAuthRefresh: true,
    });
    return response.data;
  },
  async logout() {
    const response = await axiosInstance.post(API_ROUTES.auth.logout);
    return response.data;
  },
  async changePassword(payload) {
    const response = await axiosInstance.patch(API_ROUTES.auth.changePassword, payload);
    return response.data;
  },
  async getMe() {
    const response = await axiosInstance.get(API_ROUTES.auth.me);
    return response.data;
  },
};
