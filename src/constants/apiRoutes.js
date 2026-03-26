export const API_ROUTES = {
  auth: {
    csrf: "/auth/csrf",
    register: "/auth/register",
    login: "/auth/login",
    refresh: "/auth/refresh",
    logout: "/auth/logout",
    changePassword: "/auth/change-password",
    me: "/auth/me",
  },
  campaigns: {
    list: "/campaigns",
    detail: (id) => `/campaigns/${id}`,
  },
  contents: {
    generate: "/contents/generate",
    list: "/contents",
    detail: (id) => `/contents/${id}`,
    banner: (id) => `/contents/${id}/banner`,
  },
  dashboard: {
    user: "/dashboard/user",
  },
  admin: {
    users: "/admin/users",
    userStatus: (id) => `/admin/users/${id}/status`,
    campaigns: "/admin/campaigns",
    recentContents: "/admin/contents/recent",
    deleteContent: (id) => `/admin/contents/${id}`,
    aiUsage: "/admin/stats/ai-usage",
    topUsers: "/admin/stats/top-users",
  },
};
