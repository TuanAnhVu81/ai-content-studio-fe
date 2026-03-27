function extractPlainText(document) {
  return document.body?.textContent?.replace(/\s+/g, " ").trim() ?? "";
}

function normalizeTextInput(value) {
  return typeof value === "string" ? value.replace(/\s+/g, " ").trim() : "";
}

function countKeywordOccurrences(text, keyword) {
  if (!text || !keyword) {
    return 0;
  }

  const normalizedText = text.toLowerCase();
  const normalizedKeyword = keyword.toLowerCase().trim();

  if (!normalizedKeyword) {
    return 0;
  }

  return normalizedText.split(normalizedKeyword).length - 1;
}

function normalizeLength(value) {
  return normalizeTextInput(value).length;
}

export function seoCalculator({
  htmlContent,
  keyword,
  metaTitle,
  metaDescription,
}) {
  if (!htmlContent?.trim()) {
    return null;
  }

  const parser = new DOMParser();
  const document = parser.parseFromString(htmlContent, "text/html");
  const plainText = extractPlainText(document);
  const words = plainText ? plainText.split(/\s+/).filter(Boolean) : [];
  const wordCount = words.length;
  const normalizedKeyword = normalizeTextInput(keyword);
  const normalizedMetaTitle = normalizeTextInput(metaTitle);
  const normalizedMetaDescription = normalizeTextInput(metaDescription);

  const h1Text = document.querySelector("h1")?.textContent?.toLowerCase() ?? "";
  const h2Count = document.querySelectorAll("h2").length;
  const hasH1 = normalizedKeyword
    ? h1Text.includes(normalizedKeyword.toLowerCase())
    : false;
  const hasH2 = h2Count >= 2;

  const keywordCount = countKeywordOccurrences(plainText, normalizedKeyword);
  const keywordDensity =
    wordCount > 0 ? Number((((keywordCount / wordCount) * 100) || 0).toFixed(2)) : 0;
  const densityValid = keywordDensity >= 1 && keywordDensity <= 3;
  const wordCountValid = wordCount >= 300;
  const metaTitleLength = normalizeLength(normalizedMetaTitle);
  const metaDescriptionLength = normalizeLength(normalizedMetaDescription);
  const metaTitleValid =
    metaTitleLength >= 50 &&
    metaTitleLength <= 60 &&
    normalizedMetaTitle.toLowerCase().includes(normalizedKeyword.toLowerCase());
  const metaDescriptionValid =
    metaDescriptionLength >= 120 &&
    metaDescriptionLength <= 160 &&
    normalizedMetaDescription.toLowerCase().includes(normalizedKeyword.toLowerCase());

  let score = 0;

  if (hasH1) score += 20;
  if (densityValid) score += 20;
  if (hasH2) score += 15;
  if (wordCountValid) score += 15;
  if (metaTitleValid) score += 15;
  if (metaDescriptionValid) score += 15;

  const suggestions = [];

  if (!hasH1) suggestions.push("Add the target keyword to the main H1 heading.");
  if (!densityValid) {
    suggestions.push("Keep keyword density between 1% and 3% for better balance.");
  }
  if (!hasH2) suggestions.push("Use at least two H2 sections to improve structure.");
  if (!wordCountValid) suggestions.push("Expand the article to at least 300 words.");
  if (!metaTitleValid) {
    suggestions.push("Write a 50-60 character meta title that includes the keyword.");
  }
  if (!metaDescriptionValid) {
    suggestions.push(
      "Write a 120-160 character meta description that includes the keyword."
    );
  }

  return {
    score,
    keyword_density: keywordDensity,
    has_h1: hasH1,
    has_h2: hasH2,
    word_count: wordCount,
    meta_title: normalizedMetaTitle,
    meta_description: normalizedMetaDescription,
    meta_title_valid: metaTitleValid,
    meta_description_valid: metaDescriptionValid,
    suggestions,
  };
}

export { normalizeTextInput, normalizeLength };
