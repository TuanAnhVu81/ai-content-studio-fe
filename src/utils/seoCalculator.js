function extractPlainText(document) {
  return document.body?.textContent?.replace(/\s+/g, " ").trim() ?? "";
}

function normalizeTextInput(value) {
  return typeof value === "string" ? value.replace(/\s+/g, " ").trim() : "";
}

function normalizeForSearch(value) {
  return normalizeTextInput(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9\s]/g, " ")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function includesKeyword(text, keyword) {
  const normalizedText = normalizeForSearch(text);
  const normalizedKeyword = normalizeForSearch(keyword);

  if (!normalizedText || !normalizedKeyword) {
    return false;
  }

  const keywordPattern = new RegExp(`\\b${escapeRegExp(normalizedKeyword)}\\b`, "i");
  return keywordPattern.test(normalizedText);
}

function countKeywordOccurrences(text, keyword) {
  const normalizedText = normalizeForSearch(text);
  const normalizedKeyword = normalizeForSearch(keyword);

  if (!normalizedText || !normalizedKeyword) {
    return 0;
  }

  const keywordPattern = new RegExp(`\\b${escapeRegExp(normalizedKeyword)}\\b`, "gi");
  return normalizedText.match(keywordPattern)?.length ?? 0;
}

function normalizeLength(value) {
  return normalizeTextInput(value).length;
}

function buildOpeningExcerpt(document, plainText, wordLimit = 40) {
  const preferredOpening =
    document.querySelector("h1")?.textContent ??
    document.querySelector("p")?.textContent ??
    plainText;
  const words = normalizeTextInput(preferredOpening).split(/\s+/).filter(Boolean);
  return words.slice(0, wordLimit).join(" ");
}

function containsCtaLanguage(text) {
  const normalizedText = normalizeForSearch(text);

  if (!normalizedText) {
    return false;
  }

  return [
    "discover",
    "discover more",
    "learn more",
    "shop now",
    "buy now",
    "book now",
    "contact us",
    "contact",
    "sign up",
    "join now",
    "download",
    "explore",
    "claim",
    "start now",
    "get started",
    "watch now",
    "order now",
    "read more",
    "xem ngay",
    "kham pha",
    "mua ngay",
    "lien he",
    "dang ky",
    "tim hieu",
    "xem them",
    "bat dau",
    "nhan uu dai",
    "dat lich",
    "mua ngay hom nay",
  ].some((phrase) => normalizedText.includes(phrase));
}

function hasScannableStructure({ h2Count, listCount, paragraphCount }) {
  return h2Count >= 1 || listCount >= 1 || paragraphCount >= 3;
}

function createCheck(key, label, weight, suggestion, minValue, getPassed) {
  return { key, label, weight, suggestion, minValue, getPassed };
}

function resolvePlatformSeoRules(platform) {
  const normalizedPlatform = normalizeTextInput(platform).toLowerCase();

  switch (normalizedPlatform) {
    case "email marketing":
      return {
        key: "email_marketing",
        label: "Email marketing",
        checks: [
          createCheck(
            "opening_keyword",
            "Keyword appears in opening copy",
            20,
            "Mention the target keyword in the opening email copy.",
            null,
            (context) => context.openingKeywordValid
          ),
          createCheck(
            "keyword_usage",
            "Keyword usage feels balanced",
            15,
            "Use the keyword naturally 1 to 4 times across the email copy.",
            null,
            (context) =>
              context.keywordCount >= 1 &&
              context.keywordCount <= 4 &&
              context.keywordDensity <= 3.5
          ),
          createCheck(
            "structure",
            "Uses sections or bullets",
            15,
            "Break the email into sections or bullets to improve scanability.",
            null,
            (context) =>
              context.listCount >= 1 || context.h2Count >= 1 || context.paragraphCount >= 4
          ),
          createCheck(
            "length",
            "Email copy length above 180 words",
            20,
            "Expand the email copy to at least 180 words.",
            180,
            (context) => context.wordCount >= 180
          ),
          createCheck(
            "meta_title",
            "Subject line is valid",
            15,
            "Write a 50-60 character subject line that includes the keyword.",
            null,
            (context) => context.metaTitleValid
          ),
          createCheck(
            "meta_description",
            "Preview text is valid",
            15,
            "Write a 120-160 character preview text that includes the keyword.",
            null,
            (context) => context.metaDescriptionValid
          ),
        ],
      };
    case "facebook page":
    case "instagram post":
      return {
        key: "social_post",
        label: "Social post",
        checks: [
          createCheck(
            "opening_keyword",
            "Keyword appears in opening copy",
            30,
            "Mention the target keyword in the opening lines of the post.",
            null,
            (context) => context.openingKeywordValid
          ),
          createCheck(
            "keyword_usage",
            "Keyword appears 1 to 4 times naturally",
            25,
            "Use the keyword naturally 1 to 4 times in the post.",
            null,
            (context) => context.keywordCount >= 1 && context.keywordCount <= 4
          ),
          createCheck(
            "structure",
            "Uses scannable formatting",
            15,
            "Use short paragraphs, bullets, or line breaks to improve scanability.",
            null,
            (context) => context.scannableStructureValid
          ),
          createCheck(
            "length",
            "Social copy length above 120 words",
            15,
            "Add more context so the social post reaches at least 120 words.",
            120,
            (context) => context.wordCount >= 120
          ),
          createCheck(
            "cta",
            "Includes a clear CTA",
            15,
            "Add a clear CTA so the post pushes the next action.",
            null,
            (context) => context.hasCtaLanguage
          ),
        ],
      };
    case "tiktok script":
      return {
        key: "tiktok_script",
        label: "TikTok script",
        checks: [
          createCheck(
            "opening_keyword",
            "Keyword appears in the opening hook",
            30,
            "Mention the target keyword in the opening hook of the script.",
            null,
            (context) => context.openingKeywordValid
          ),
          createCheck(
            "keyword_usage",
            "Keyword appears 1 to 4 times naturally",
            20,
            "Use the keyword naturally 1 to 4 times across the script.",
            null,
            (context) => context.keywordCount >= 1 && context.keywordCount <= 4
          ),
          createCheck(
            "structure",
            "Uses clear spoken beats",
            15,
            "Break the script into clear beats or short spoken sections.",
            null,
            (context) => context.paragraphCount >= 3 || context.listCount >= 1
          ),
          createCheck(
            "length",
            "Script length above 100 words",
            20,
            "Add a few more spoken beats so the script reaches at least 100 words.",
            100,
            (context) => context.wordCount >= 100
          ),
          createCheck(
            "cta",
            "Includes a clear CTA",
            15,
            "Close with a clear CTA or audience prompt.",
            null,
            (context) => context.hasCtaLanguage
          ),
        ],
      };
    case "google ads":
      return {
        key: "google_ads",
        label: "Google Ads",
        checks: [
          createCheck(
            "opening_keyword",
            "Keyword appears in opening copy",
            30,
            "Mention the target keyword in the opening ad copy.",
            null,
            (context) => context.openingKeywordValid
          ),
          createCheck(
            "keyword_usage",
            "Keyword appears 1 to 3 times naturally",
            20,
            "Keep the keyword present but concise, around 1 to 3 mentions.",
            null,
            (context) => context.keywordCount >= 1 && context.keywordCount <= 3
          ),
          createCheck(
            "length",
            "Ad copy length above 80 words",
            25,
            "Add a little more commercial detail so the ad copy reaches at least 80 words.",
            80,
            (context) => context.wordCount >= 80
          ),
          createCheck(
            "cta",
            "Includes a clear CTA",
            25,
            "Use a direct CTA that supports conversion intent.",
            null,
            (context) => context.hasCtaLanguage
          ),
        ],
      };
    case "website blog":
    default:
      return {
        key: "website_blog",
        label: "Website blog",
        checks: [
          createCheck(
            "h1",
            "Keyword appears in H1",
            20,
            "Add the target keyword to the main H1 heading.",
            null,
            (context) => context.hasH1
          ),
          createCheck(
            "density",
            "Keyword density between 1% and 3%",
            20,
            "Keep keyword density between 1% and 3% for better balance.",
            null,
            (context) => context.keywordDensity >= 1 && context.keywordDensity <= 3
          ),
          createCheck(
            "h2",
            "At least two H2 headings",
            15,
            "Use at least two H2 sections to improve structure.",
            null,
            (context) => context.h2Count >= 2
          ),
          createCheck(
            "length",
            "Content length above 300 words",
            15,
            "Expand the article to at least 300 words.",
            300,
            (context) => context.wordCount >= 300
          ),
          createCheck(
            "meta_title",
            "Meta title is valid",
            15,
            "Write a 50-60 character meta title that includes the keyword.",
            null,
            (context) => context.metaTitleValid
          ),
          createCheck(
            "meta_description",
            "Meta description is valid",
            15,
            "Write a 120-160 character meta description that includes the keyword.",
            null,
            (context) => context.metaDescriptionValid
          ),
        ],
      };
  }
}

export function seoCalculator({
  htmlContent,
  keyword,
  metaTitle,
  metaDescription,
  platform,
}) {
  if (!htmlContent?.trim()) {
    return null;
  }

  const parser = new DOMParser();
  const document = parser.parseFromString(htmlContent, "text/html");
  const plainText = extractPlainText(document);
  const openingText = buildOpeningExcerpt(document, plainText);
  const words = plainText ? plainText.split(/\s+/).filter(Boolean) : [];
  const wordCount = words.length;
  const normalizedKeyword = normalizeTextInput(keyword);
  const normalizedMetaTitle = normalizeTextInput(metaTitle);
  const normalizedMetaDescription = normalizeTextInput(metaDescription);

  const h1Text = document.querySelector("h1")?.textContent ?? "";
  const h2Count = document.querySelectorAll("h2").length;
  const paragraphCount = document.querySelectorAll("p").length;
  const listCount =
    document.querySelectorAll("ul").length + document.querySelectorAll("ol").length;

  const hasH1 = includesKeyword(h1Text, normalizedKeyword);
  const hasH2 = h2Count >= 2;
  const openingKeywordValid = includesKeyword(openingText, normalizedKeyword);
  const keywordCount = countKeywordOccurrences(plainText, normalizedKeyword);
  const keywordDensity =
    wordCount > 0 ? Number((((keywordCount / wordCount) * 100) || 0).toFixed(2)) : 0;
  const metaTitleLength = normalizeLength(normalizedMetaTitle);
  const metaDescriptionLength = normalizeLength(normalizedMetaDescription);
  const metaTitleValid =
    metaTitleLength >= 50 &&
    metaTitleLength <= 60 &&
    includesKeyword(normalizedMetaTitle, normalizedKeyword);
  const metaDescriptionValid =
    metaDescriptionLength >= 120 &&
    metaDescriptionLength <= 160 &&
    includesKeyword(normalizedMetaDescription, normalizedKeyword);
  const scannableStructureValid = hasScannableStructure({
    h2Count,
    listCount,
    paragraphCount,
  });
  const hasCtaLanguage = containsCtaLanguage(
    [normalizedMetaDescription, plainText].filter(Boolean).join(" ")
  );

  const context = {
    plainText,
    openingText,
    wordCount,
    keywordCount,
    keywordDensity,
    h2Count,
    paragraphCount,
    listCount,
    hasH1,
    hasH2,
    openingKeywordValid,
    metaTitleValid,
    metaDescriptionValid,
    scannableStructureValid,
    hasCtaLanguage,
  };

  const ruleSet = resolvePlatformSeoRules(platform);
  const checks = ruleSet.checks.map((check) => ({
    key: check.key,
    label: check.label,
    weight: check.weight,
    min_value: check.minValue ?? null,
    passed: check.getPassed(context),
    suggestion: check.suggestion,
  }));
  const score = checks.reduce(
    (sum, check) => (check.passed ? sum + check.weight : sum),
    0
  );
  const suggestions = checks
    .filter((check) => !check.passed)
    .map((check) => check.suggestion);
  const lengthCheck = checks.find((check) => check.key === "length");

  return {
    score,
    platform_rule_set: ruleSet.key,
    platform_rule_label: ruleSet.label,
    keyword_density: keywordDensity,
    keyword_count: keywordCount,
    has_h1: hasH1,
    has_h2: hasH2,
    word_count: wordCount,
    length_rule_label: lengthCheck?.label ?? "Content length rule",
    length_rule_min_words: lengthCheck?.min_value ?? null,
    length_rule_passed: lengthCheck?.passed ?? false,
    meta_title: normalizedMetaTitle,
    meta_description: normalizedMetaDescription,
    meta_title_valid: metaTitleValid,
    meta_description_valid: metaDescriptionValid,
    checks,
    suggestions,
  };
}

export { normalizeLength, normalizeTextInput, resolvePlatformSeoRules };
