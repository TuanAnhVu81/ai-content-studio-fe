import { API_ROUTES } from "@/constants/apiRoutes";
import { axiosInstance } from "@/services/axiosInstance";

function unwrapPayload(payload) {
  return payload?.data ?? payload;
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

function normalizePage(payload, normalizer) {
  const data = unwrapPayload(payload) ?? {};
  const content = Array.isArray(data.content)
    ? data.content
    : Array.isArray(data.items)
      ? data.items
      : Array.isArray(data)
        ? data
        : [];

  const pageNumber = data.number ?? data.page ?? 0;
  const pageSize = data.size ?? data.page_size ?? data.pageSize ?? content.length ?? 10;
  const totalPages = data.total_pages ?? data.totalPages ?? data.pages ?? 1;
  const totalElements =
    data.total_elements ?? data.totalElements ?? data.total ?? content.length;

  return {
    content: content.map(normalizer).filter(Boolean),
    number: pageNumber,
    size: pageSize,
    totalPages,
    totalElements,
    first: data.first ?? pageNumber === 0,
    last: data.last ?? pageNumber >= totalPages - 1,
  };
}

function normalizeAdminUser(user) {
  if (!user) {
    return null;
  }

  return {
    id: user.id,
    email: user.email ?? "",
    full_name: user.full_name ?? user.fullName ?? "",
    status: user.status ?? "ACTIVE",
    roles: Array.isArray(user.roles) ? user.roles : [],
    created_at: user.created_at ?? user.createdAt ?? null,
    updated_at: user.updated_at ?? user.updatedAt ?? null,
  };
}

function normalizeAdminCampaign(campaign) {
  if (!campaign) {
    return null;
  }

  return {
    id: campaign.id,
    name: campaign.name ?? "",
    status: campaign.status ?? "ACTIVE",
    owner_email: campaign.owner_email ?? campaign.ownerEmail ?? "unknown",
    content_count: Number(campaign.content_count ?? campaign.contentCount ?? 0) || 0,
    user_id: campaign.user_id ?? campaign.userId ?? null,
    created_at: campaign.created_at ?? campaign.createdAt ?? null,
    updated_at: campaign.updated_at ?? campaign.updatedAt ?? null,
  };
}

function normalizeRecentContent(content) {
  if (!content) {
    return null;
  }

  return {
    id: content.id,
    campaign_id: content.campaign_id ?? content.campaignId ?? null,
    campaign_name: content.campaign_name ?? content.campaignName ?? "",
    user_id: content.user_id ?? content.userId ?? null,
    owner_email: content.owner_email ?? content.ownerEmail ?? "",
    target_keyword: content.target_keyword ?? content.targetKeyword ?? "",
    content_preview: content.content_preview ?? content.contentPreview ?? "",
    banner_url: content.banner_url ?? content.bannerUrl ?? "",
    status: content.status ?? "DRAFT",
    created_at: content.created_at ?? content.createdAt ?? null,
  };
}

function normalizeModelUsage(item) {
  if (!item) {
    return null;
  }

  return {
    model_name: item.model_name ?? item.modelName ?? "unknown",
    total_tokens: Number(item.total_tokens ?? item.totalTokens ?? 0) || 0,
  };
}

function normalizeTopUser(item) {
  if (!item) {
    return null;
  }

  return {
    user_id: item.user_id ?? item.userId ?? null,
    email: item.email ?? "",
    full_name: item.full_name ?? item.fullName ?? "",
    total_tokens: Number(item.total_tokens ?? item.totalTokens ?? 0) || 0,
    prompt_tokens: Number(item.prompt_tokens ?? item.promptTokens ?? 0) || 0,
    response_tokens: Number(item.response_tokens ?? item.responseTokens ?? 0) || 0,
  };
}

function normalizeAiUsageStats(payload) {
  const data = unwrapPayload(payload) ?? {};

  return {
    from: data.from ?? null,
    to: data.to ?? null,
    total_prompt_tokens: Number(
      data.total_prompt_tokens ?? data.totalPromptTokens ?? 0
    ) || 0,
    total_response_tokens: Number(
      data.total_response_tokens ?? data.totalResponseTokens ?? 0
    ) || 0,
    total_tokens: Number(data.total_tokens ?? data.totalTokens ?? 0) || 0,
    tokens_by_model: Array.isArray(data.tokens_by_model ?? data.tokensByModel)
      ? (data.tokens_by_model ?? data.tokensByModel)
          .map(normalizeModelUsage)
          .filter(Boolean)
      : [],
  };
}

function normalizeDateRange(range = {}) {
  return buildParams({
    from: range.from || undefined,
    to: range.to || undefined,
  });
}

export const adminService = {
  async getUsers(filters) {
    const response = await axiosInstance.get(API_ROUTES.admin.users, {
      params: buildParams(filters),
    });

    return normalizePage(response.data, normalizeAdminUser);
  },

  async updateUserStatus(id, payload) {
    const response = await axiosInstance.patch(API_ROUTES.admin.userStatus(id), payload);
    return normalizeAdminUser(unwrapPayload(response.data));
  },

  async getCampaigns(filters) {
    const response = await axiosInstance.get(API_ROUTES.admin.campaigns, {
      params: buildParams(filters),
    });

    return normalizePage(response.data, normalizeAdminCampaign);
  },

  async getRecentContents() {
    const response = await axiosInstance.get(API_ROUTES.admin.recentContents);
    const data = unwrapPayload(response.data);

    return Array.isArray(data) ? data.map(normalizeRecentContent).filter(Boolean) : [];
  },

  async deleteContent(id, reason) {
    await axiosInstance.delete(API_ROUTES.admin.deleteContent(id), {
      data: { reason },
    });
    return true;
  },

  async getAiUsageStats(range) {
    const response = await axiosInstance.get(API_ROUTES.admin.aiUsage, {
      params: normalizeDateRange(range),
    });

    return normalizeAiUsageStats(response.data);
  },

  async getTopUsers(range) {
    const response = await axiosInstance.get(API_ROUTES.admin.topUsers, {
      params: normalizeDateRange(range),
    });
    const data = unwrapPayload(response.data);

    return Array.isArray(data) ? data.map(normalizeTopUser).filter(Boolean) : [];
  },
};
