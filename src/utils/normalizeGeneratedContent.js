function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function applyInlineFormatting(value) {
  return value
    .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/__(.+?)__/g, "<strong>$1</strong>")
    .replace(/(?<!\*)\*(?!\s)(.+?)(?<!\s)\*(?!\*)/g, "<em>$1</em>")
    .replace(/_(.+?)_/g, "<em>$1</em>");
}

function formatBlock(block) {
  const lines = block.split("\n").map((line) => line.trim()).filter(Boolean);

  if (lines.length === 0) {
    return "";
  }

  if (lines.every((line) => /^[-*]\s+/.test(line))) {
    const items = lines
      .map((line) => line.replace(/^[-*]\s+/, ""))
      .map((line) => `<li>${applyInlineFormatting(escapeHtml(line))}</li>`)
      .join("");

    return `<ul>${items}</ul>`;
  }

  if (lines.every((line) => /^\d+\.\s+/.test(line))) {
    const items = lines
      .map((line) => line.replace(/^\d+\.\s+/, ""))
      .map((line) => `<li>${applyInlineFormatting(escapeHtml(line))}</li>`)
      .join("");

    return `<ol>${items}</ol>`;
  }

  if (lines.length === 1) {
    const [line] = lines;
    const headingMatch = line.match(/^(#{1,3})\s+(.+)$/);

    if (headingMatch) {
      const level = headingMatch[1].length;
      const text = applyInlineFormatting(escapeHtml(headingMatch[2]));
      return `<h${level}>${text}</h${level}>`;
    }
  }

  const paragraph = lines
    .map((line) => applyInlineFormatting(escapeHtml(line)))
    .join("<br />");

  return `<p>${paragraph}</p>`;
}

export function normalizeGeneratedContent(value) {
  if (!value || typeof value !== "string") {
    return "";
  }

  const trimmed = value.trim();

  if (!trimmed) {
    return "";
  }

  if (/<\/?[a-z][\s\S]*>/i.test(trimmed)) {
    return trimmed;
  }

  return trimmed
    .replace(/\r\n/g, "\n")
    .split(/\n{2,}/)
    .map(formatBlock)
    .filter(Boolean)
    .join("");
}
