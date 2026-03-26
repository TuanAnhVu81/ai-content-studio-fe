export const queryKeys = {
  campaigns: {
    all: ["campaigns"],
    detail: (id) => ["campaigns", "detail", id],
    list: (filters = {}) => ["campaigns", "list", filters],
  },
  contents: {
    all: ["contents"],
    list: (filters = {}) => ["contents", "list", filters],
    byCampaign: (campaignId, filters = {}) => [
      "contents",
      "campaign",
      campaignId,
      filters,
    ],
    detail: (id) => ["contents", "detail", id],
  },
  dashboard: {
    user: ["dashboard", "user"],
  },
  admin: {
    users: (filters = {}) => ["admin", "users", filters],
    campaigns: (filters = {}) => ["admin", "campaigns", filters],
    aiStats: (dateRange = {}) => ["admin", "ai-stats", dateRange],
    topUsers: ["admin", "top-users"],
    recentContents: ["admin", "recent-contents"],
  },
};
