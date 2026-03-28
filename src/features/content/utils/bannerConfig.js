import { getDefaultBannerTemplateKey } from "@/features/content/bannerTemplates";

function normalizeWhitespace(value) {
  return (value || "").replace(/\s+/g, " ").trim();
}

function takeLeadingSentence(value) {
  const normalized = normalizeWhitespace(value);
  const match = normalized.match(/^(.+?[.!?])(?:\s|$)/);

  if (match?.[1]) {
    return match[1].trim();
  }

  return normalized;
}

function truncateToWholeWords(value, maxChars) {
  const normalized = normalizeWhitespace(value);

  if (normalized.length <= maxChars) {
    return normalized;
  }

  const trimmed = normalized.slice(0, maxChars);
  const lastSpaceIndex = trimmed.lastIndexOf(" ");

  if (lastSpaceIndex <= 0) {
    return trimmed.trim();
  }

  return trimmed.slice(0, lastSpaceIndex).trim();
}

function trimClauseEnding(value) {
  return value.replace(/[,:;/-]+$/g, "").trim();
}

export function containsVietnameseText(value) {
  return /[ăâđêôơưàáạảãằắặẳẵầấậẩẫèéẹẻẽềếệểễìíịỉĩòóọỏõồốộổỗờớợởỡùúụủũừứựửữỳýỵỷỹ]/i.test(
    value || ""
  );
}

function buildShortHeadline(value, maxChars) {
  const normalized = normalizeWhitespace(value);

  if (!normalized) {
    return "";
  }

  if (normalized.length <= maxChars) {
    return normalized;
  }

  const firstClause = trimClauseEnding(normalized.split(/[:|-]/)[0] ?? "");
  if (firstClause && firstClause.length <= maxChars && firstClause.split(" ").length >= 3) {
    return firstClause;
  }

  return truncateToWholeWords(normalized, maxChars);
}

function buildBannerSubtext(value, maxChars) {
  const normalized = normalizeWhitespace(value);

  if (!normalized) {
    return "";
  }

  const firstSentence = trimClauseEnding(takeLeadingSentence(normalized));
  if (firstSentence.length <= maxChars) {
    return firstSentence;
  }

  const firstClause = trimClauseEnding(normalized.split(/[,;:]/)[0] ?? "");
  if (firstClause && firstClause.length <= maxChars && firstClause.split(" ").length >= 6) {
    return firstClause;
  }

  return truncateToWholeWords(firstSentence, maxChars);
}

export function extractBannerCopy(
  htmlContent,
  fallbackHeadline,
  fallbackSubtext,
  format = "feed"
) {
  const maxHeadlineChars = format === "story" ? 84 : 120;
  const maxSubtextChars = format === "story" ? 120 : 160;
  const preferredSubtext = normalizeWhitespace(fallbackSubtext);

  if (typeof window === "undefined") {
    return {
      headline: normalizeWhitespace(fallbackHeadline) || "Untitled banner",
      subtext: preferredSubtext || "",
    };
  }

  const parser = new DOMParser();
  const documentNode = parser.parseFromString(
    `<article>${htmlContent}</article>`,
    "text/html"
  );
  const headline =
    normalizeWhitespace(documentNode.querySelector("h1")?.textContent) ||
    normalizeWhitespace(fallbackHeadline) ||
    "Untitled banner";
  const bodyParagraph =
    normalizeWhitespace(documentNode.querySelector("p")?.textContent) ||
    "Turn your refined copy into a social-ready banner preview.";

  return {
    headline:
      format === "story"
        ? buildShortHeadline(headline, maxHeadlineChars)
        : truncateToWholeWords(headline, maxHeadlineChars),
    subtext: preferredSubtext || buildBannerSubtext(bodyParagraph, maxSubtextChars),
  };
}

export function getDefaultCta(text) {
  return containsVietnameseText(text) ? "Khám phá ngay" : "Discover more";
}

export function createBannerConfig({
  htmlContent,
  metaDescription,
  fallbackHeadline,
  format = "feed",
}) {
  const copy = extractBannerCopy(
    htmlContent,
    fallbackHeadline,
    metaDescription,
    format
  );
  const textForLanguageCheck = [
    copy.headline,
    copy.subtext,
    fallbackHeadline,
    metaDescription,
  ]
    .filter(Boolean)
    .join(" ");

  return {
    format,
    template_key: getDefaultBannerTemplateKey(format),
    headline: copy.headline,
    subtext: copy.subtext,
    cta: getDefaultCta(textForLanguageCheck),
  };
}

export function normalizeBannerConfig(bannerConfig) {
  if (!bannerConfig) {
    return null;
  }

  const format = bannerConfig.format ?? "feed";

  return {
    format,
    template_key:
      bannerConfig.template_key ??
      bannerConfig.templateKey ??
      getDefaultBannerTemplateKey(format),
    headline: normalizeWhitespace(bannerConfig.headline),
    subtext: normalizeWhitespace(bannerConfig.subtext),
    cta: normalizeWhitespace(bannerConfig.cta),
  };
}
