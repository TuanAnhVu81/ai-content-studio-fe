import { API_ROUTES } from "@/constants/apiRoutes";
import { axiosInstance } from "@/services/axiosInstance";

function unwrapPayload(payload) {
  return payload?.data ?? payload;
}

function normalizeRecentContent(content) {
  if (!content) {
    return null;
  }

  return {
    id: content.id,
    campaign_id: content.campaign_id ?? content.campaignId ?? null,
    campaign_name: content.campaign_name ?? content.campaignName ?? "",
    target_keyword: content.target_keyword ?? content.targetKeyword ?? "Untitled keyword",
    status: content.status ?? "DRAFT",
    created_at: content.created_at ?? content.createdAt ?? null,
    updated_at: content.updated_at ?? content.updatedAt ?? null,
  };
}

function toSafeNumber(value) {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : 0;
}

function normalizeDashboard(payload) {
  const data = unwrapPayload(payload) ?? {};
  const recentContents = Array.isArray(data.recent_contents)
    ? data.recent_contents
    : Array.isArray(data.recentContents)
      ? data.recentContents
      : [];

  return {
    total_campaigns: toSafeNumber(data.total_campaigns ?? data.totalCampaigns),
    total_contents: toSafeNumber(data.total_contents ?? data.totalContents),
    total_tokens_used_30_days: toSafeNumber(
      data.total_tokens_used_30_days ?? data.totalTokensUsed30Days
    ),
    recent_contents: recentContents.map(normalizeRecentContent).filter(Boolean),
  };
}

export const dashboardService = {
  async getUserDashboard() {
    const response = await axiosInstance.get(API_ROUTES.dashboard.user);
    return normalizeDashboard(response.data);
  },
};
