import { forwardRef, useMemo } from "react";

import { cn } from "@/lib/utils";

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

function extractBannerCopy(htmlContent, fallbackHeadline, fallbackSubtext, template) {
  const maxChars = template === "story" ? 96 : 96;
  const preferredSubtext = normalizeWhitespace(fallbackSubtext);

  if (typeof window === "undefined") {
    return {
      headline: normalizeWhitespace(fallbackHeadline) || "Untitled banner",
      subtext: preferredSubtext || "",
    };
  }

  const parser = new DOMParser();
  const documentNode = parser.parseFromString(`<article>${htmlContent}</article>`, "text/html");
  const headline =
    normalizeWhitespace(documentNode.querySelector("h1")?.textContent) ||
    normalizeWhitespace(fallbackHeadline) ||
    "Untitled banner";
  const bodyParagraph =
    normalizeWhitespace(documentNode.querySelector("p")?.textContent) ||
    "Turn your refined copy into a social-ready banner preview.";

  const headlineForTemplate =
    template === "story" ? buildShortHeadline(headline, 96) : headline;
  const subtextForTemplate =
    preferredSubtext || buildBannerSubtext(bodyParagraph, maxChars);

  return {
    headline: headlineForTemplate,
    subtext: subtextForTemplate,
  };
}

const templateConfig = {
  feed: {
    frameClassName: "max-w-[540px]",
    style: { width: 540, minHeight: 540 },
    headlineClamp: 4,
    subtextClamp: 3,
  },
  story: {
    frameClassName: "max-w-[360px]",
    style: { width: 360, minHeight: 640 },
    headlineClamp: 5,
    subtextClamp: 5,
  },
};

export const BannerPreview = forwardRef(function BannerPreview(
  { htmlContent, template = "feed", fallbackHeadline, fallbackSubtext },
  ref
) {
  const copy = useMemo(
    () => extractBannerCopy(htmlContent, fallbackHeadline, fallbackSubtext, template),
    [fallbackHeadline, fallbackSubtext, htmlContent, template]
  );

  const config = templateConfig[template] ?? templateConfig.feed;
  const headlineLength = copy.headline.length;
  const headlineClassName =
    template === "story"
      ? headlineLength > 40
        ? "max-w-[92%] text-[1.95rem] leading-[1.04]"
        : "max-w-[92%] text-[2.15rem] leading-[1.03]"
      : headlineLength > 70
        ? "max-w-[88%] text-[2.05rem] leading-[1]"
        : headlineLength > 48
          ? "max-w-[88%] text-[2.2rem] leading-[0.99]"
          : "max-w-[88%] text-[2.35rem] leading-[0.98]";

  return (
    <div className={cn("mx-auto w-full", config.frameClassName)}>
      <article
        ref={ref}
        style={config.style}
        className={cn(
          "relative overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950 p-7 text-white shadow-[0_24px_80px_rgba(15,23,42,0.35)]",
          template === "story" ? "aspect-[9/16]" : "aspect-square"
        )}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.22),_transparent_34%),linear-gradient(145deg,_rgba(15,23,42,0.95),_rgba(30,41,59,0.92))]" />
        <div className="absolute -right-10 top-10 size-32 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-28 w-full bg-gradient-to-t from-brand-primary/20 to-transparent" />
        <div className="absolute -left-8 bottom-12 size-28 rounded-full bg-sky-500/15 blur-3xl" />
        <div className="absolute right-8 top-8 h-24 w-24 rounded-full border border-white/10 bg-white/5" />

        <div className="relative flex h-full flex-col justify-end">
          <div className={cn("space-y-5", template === "story" ? "pb-2" : "pb-1")}>
            <h3
              className={cn(
                "font-semibold tracking-tight text-white",
                headlineClassName
              )}
            >
              {copy.headline}
            </h3>

            {copy.subtext ? (
              <p
                className={cn(
                  "max-w-[86%] text-slate-200/95",
                  template === "story"
                    ? "text-[1rem] leading-8"
                    : "text-[1.02rem] leading-8"
                )}
              >
                {copy.subtext}
              </p>
            ) : null}

            <div className="pt-4">
              <div className="inline-flex rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-slate-950 shadow-[0_12px_30px_rgba(255,255,255,0.15)]">
                Discover more
              </div>
            </div>
          </div>
        </div>
      </article>
    </div>
  );
});
