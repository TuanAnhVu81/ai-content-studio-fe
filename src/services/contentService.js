import { API_ROUTES } from "@/constants/apiRoutes";
import { axiosInstance } from "@/services/axiosInstance";

function unwrapPayload(payload) {
  return payload?.data ?? payload;
}

function normalizeSeoMetadata(seoMetadata) {
  if (!seoMetadata) {
    return null;
  }

  return {
    score: Number(seoMetadata.score ?? 0),
    keyword_density: Number(
      seoMetadata.keyword_density ?? seoMetadata.keywordDensity ?? 0
    ),
    has_h1: Boolean(seoMetadata.has_h1 ?? seoMetadata.hasH1),
    has_h2: Boolean(seoMetadata.has_h2 ?? seoMetadata.hasH2),
    word_count: Number(seoMetadata.word_count ?? seoMetadata.wordCount ?? 0),
    meta_title: seoMetadata.meta_title ?? seoMetadata.metaTitle ?? "",
    meta_description:
      seoMetadata.meta_description ?? seoMetadata.metaDescription ?? "",
    meta_title_valid: Boolean(
      seoMetadata.meta_title_valid ?? seoMetadata.metaTitleValid
    ),
    meta_description_valid: Boolean(
      seoMetadata.meta_description_valid ?? seoMetadata.metaDescriptionValid
    ),
    suggestions: Array.isArray(seoMetadata.suggestions)
      ? seoMetadata.suggestions
      : [],
  };
}

function normalizeBannerConfig(bannerConfig) {
  if (!bannerConfig) {
    return null;
  }

  return {
    format: bannerConfig.format ?? "feed",
    template_key:
      bannerConfig.template_key ?? bannerConfig.templateKey ?? "feed-editorial",
    headline: bannerConfig.headline ?? "",
    subtext: bannerConfig.subtext ?? "",
    cta: bannerConfig.cta ?? "",
  };
}

function normalizeContent(content) {
  if (!content) {
    return null;
  }

  return {
    id: content.id,
    campaign_id: content.campaign_id ?? content.campaignId ?? null,
    campaign_name: content.campaign_name ?? content.campaignName ?? "",
    target_keyword: content.target_keyword ?? content.targetKeyword ?? "",
    prompt_config: {
      platform:
        content.prompt_config?.platform ?? content.promptConfig?.platform ?? "",
      tone: content.prompt_config?.tone ?? content.promptConfig?.tone ?? "",
      length:
        content.prompt_config?.length ?? content.promptConfig?.length ?? "auto",
      language:
        content.prompt_config?.language ?? content.promptConfig?.language ?? "",
    },
    generated_text: content.generated_text ?? content.generatedText ?? "",
    seo_metadata: normalizeSeoMetadata(
      content.seo_metadata ?? content.seoMetadata
    ),
    banner_url: content.banner_url ?? content.bannerUrl ?? null,
    banner_config: normalizeBannerConfig(
      content.banner_config ?? content.bannerConfig
    ),
    status: content.status ?? "DRAFT",
    created_at: content.created_at ?? content.createdAt ?? null,
    updated_at: content.updated_at ?? content.updatedAt ?? null,
  };
}

function normalizeContentPage(payload) {
  const data = unwrapPayload(payload) ?? {};
  const content = Array.isArray(data.content)
    ? data.content
    : Array.isArray(data.items)
      ? data.items
      : Array.isArray(data.contents)
        ? data.contents
        : Array.isArray(data)
          ? data
          : [];

  const pageNumber = data.number ?? data.page ?? 0;
  const pageSize = data.size ?? data.pageSize ?? content.length ?? 10;
  const totalPages = data.totalPages ?? data.pages ?? 1;
  const totalElements = data.totalElements ?? data.total ?? content.length;

  return {
    content: content.map(normalizeContent),
    number: pageNumber,
    size: pageSize,
    totalPages,
    totalElements,
    first: data.first ?? pageNumber === 0,
    last: data.last ?? pageNumber >= totalPages - 1,
  };
}

function buildListParams(filters = {}) {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") {
      return;
    }

    params.set(key, value);
  });

  return params;
}

function serializeSeoMetadata(seoMetadata) {
  if (!seoMetadata) {
    return null;
  }

  return {
    score: seoMetadata.score,
    keyword_density: seoMetadata.keyword_density,
    has_h1: seoMetadata.has_h1,
    has_h2: seoMetadata.has_h2,
    word_count: seoMetadata.word_count,
    meta_title: seoMetadata.meta_title,
    meta_description: seoMetadata.meta_description,
    meta_title_valid: seoMetadata.meta_title_valid,
    meta_description_valid: seoMetadata.meta_description_valid,
    suggestions: seoMetadata.suggestions,
  };
}

export const contentService = {
  async generateContent(payload) {
    const response = await axiosInstance.post(API_ROUTES.contents.generate, payload);
    return normalizeContent(unwrapPayload(response.data));
  },
  async getContents(filters) {
    const response = await axiosInstance.get(API_ROUTES.contents.list, {
      params: buildListParams(filters),
    });

    return normalizeContentPage(response.data);
  },
  async getContent(id) {
    const response = await axiosInstance.get(API_ROUTES.contents.detail(id));
    return normalizeContent(unwrapPayload(response.data));
  },
  async updateContent(id, payload) {
    const response = await axiosInstance.put(API_ROUTES.contents.detail(id), {
      generated_text: payload.generated_text,
      seo_metadata: serializeSeoMetadata(payload.seo_metadata),
    });

    return normalizeContent(unwrapPayload(response.data));
  },
  async updateBanner(id, payload) {
    const response = await axiosInstance.put(API_ROUTES.contents.banner(id), {
      banner_url: payload.banner_url,
      banner_config: payload.banner_config,
    });

    return normalizeContent(unwrapPayload(response.data));
  },
  async deleteContent(id) {
    await axiosInstance.delete(API_ROUTES.contents.detail(id));
    return true;
  },
};
