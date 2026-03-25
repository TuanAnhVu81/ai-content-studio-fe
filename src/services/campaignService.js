import { API_ROUTES } from "@/constants/apiRoutes";
import { axiosInstance } from "@/services/axiosInstance";

function unwrapPayload(payload) {
  return payload?.data ?? payload;
}

function normalizeCampaign(campaign) {
  if (!campaign) {
    return null;
  }

  return {
    ...campaign,
    id: campaign.id,
    name: campaign.name ?? "",
    status: campaign.status ?? "DRAFT",
    metadata: campaign.metadata ?? {},
    created_at: campaign.created_at ?? campaign.createdAt ?? null,
    updated_at: campaign.updated_at ?? campaign.updatedAt ?? null,
  };
}

function normalizeCampaignPage(payload) {
  const data = unwrapPayload(payload) ?? {};
  const content = Array.isArray(data.content)
    ? data.content
    : Array.isArray(data.items)
      ? data.items
      : Array.isArray(data.campaigns)
        ? data.campaigns
        : Array.isArray(data)
          ? data
          : [];

  const pageNumber = data.number ?? data.page ?? 0;
  const pageSize = data.size ?? data.pageSize ?? content.length ?? 10;
  const totalPages = data.totalPages ?? data.pages ?? 1;
  const totalElements = data.totalElements ?? data.total ?? content.length;

  return {
    content: content.map(normalizeCampaign),
    number: pageNumber,
    size: pageSize,
    totalPages,
    totalElements,
    first: data.first ?? pageNumber === 0,
    last: data.last ?? pageNumber >= totalPages - 1,
  };
}

function buildParams(filters = {}) {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "" || value === "ALL") {
      return;
    }

    params.set(key, value);
  });

  return params;
}

function normalizeMetadata(metadata) {
  const nextMetadata = {
    goal: metadata?.goal?.trim() || undefined,
    target_audience: metadata?.target_audience?.trim() || undefined,
  };

  return Object.values(nextMetadata).some(Boolean) ? nextMetadata : null;
}

export const campaignService = {
  async getCampaigns(filters) {
    const response = await axiosInstance.get(API_ROUTES.campaigns.list, {
      params: buildParams(filters),
    });

    return normalizeCampaignPage(response.data);
  },
  async getCampaign(id) {
    const response = await axiosInstance.get(API_ROUTES.campaigns.detail(id));
    return normalizeCampaign(unwrapPayload(response.data));
  },
  async createCampaign(payload) {
    const response = await axiosInstance.post(API_ROUTES.campaigns.list, {
      ...payload,
      metadata: normalizeMetadata(payload.metadata),
    });

    return normalizeCampaign(unwrapPayload(response.data));
  },
  async updateCampaign(id, payload) {
    const response = await axiosInstance.put(API_ROUTES.campaigns.detail(id), {
      ...payload,
      metadata: normalizeMetadata(payload.metadata),
    });

    return normalizeCampaign(unwrapPayload(response.data));
  },
  async deleteCampaign(id) {
    await axiosInstance.delete(API_ROUTES.campaigns.detail(id));
    return true;
  },
};
