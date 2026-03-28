export const bannerTemplates = {
  "feed-editorial": {
    key: "feed-editorial",
    format: "feed",
    label: "Editorial",
    imageSrc: "/banner-templates/feed-editorial.svg",
    frameClassName: "max-w-[640px]",
    frameStyle: { width: 640, minHeight: 640 },
    articleClassName: "aspect-square",
    overlayClassName:
      "bg-[linear-gradient(180deg,rgba(15,23,42,0.04),rgba(15,23,42,0.14)_22%,rgba(15,23,42,0.78)_68%,rgba(15,23,42,0.92))]",
    contentClassName: "justify-end pb-2",
    textClassName: "text-white",
    subtextToneClassName: "text-slate-100/95",
    headlineClassName: "max-w-[80%] text-[3rem] leading-[0.96]",
    subtextClassName: "max-w-[74%] text-[1.05rem] leading-8",
    ctaToneClassName: "bg-white text-slate-950",
    ctaClassName: "px-6 py-3 text-base",
  },
  "feed-minimal": {
    key: "feed-minimal",
    format: "feed",
    label: "Minimal",
    imageSrc: "/banner-templates/feed-minimal.svg",
    frameClassName: "max-w-[640px]",
    frameStyle: { width: 640, minHeight: 640 },
    articleClassName: "aspect-square",
    overlayClassName:
      "bg-[linear-gradient(180deg,rgba(248,250,252,0.12),rgba(248,250,252,0.28)_20%,rgba(248,250,252,0.82)_66%,rgba(248,250,252,0.92))]",
    contentClassName: "justify-between pt-9 pb-9",
    textClassName: "text-slate-950",
    subtextToneClassName: "text-slate-700",
    headlineClassName: "max-w-[74%] text-[2.65rem] leading-[0.98]",
    subtextClassName: "max-w-[68%] text-[1rem] leading-7",
    ctaToneClassName: "bg-slate-950 text-white",
    ctaClassName: "px-5 py-2.5 text-sm",
  },
  "feed-promo": {
    key: "feed-promo",
    format: "feed",
    label: "Promo",
    imageSrc: "/banner-templates/feed-promo.svg",
    frameClassName: "max-w-[640px]",
    frameStyle: { width: 640, minHeight: 640 },
    articleClassName: "aspect-square",
    overlayClassName:
      "bg-[linear-gradient(180deg,rgba(15,23,42,0.08),rgba(15,23,42,0.12)_16%,rgba(15,23,42,0.74)_64%,rgba(15,23,42,0.9))]",
    contentClassName: "justify-end pb-5",
    textClassName: "text-white",
    subtextToneClassName: "text-slate-100/92",
    headlineClassName: "max-w-[76%] text-[2.85rem] leading-[0.95]",
    subtextClassName: "max-w-[64%] text-[0.98rem] leading-7",
    ctaToneClassName: "bg-amber-300 text-slate-950",
    ctaClassName: "px-6 py-3 text-sm",
  },
  "story-editorial": {
    key: "story-editorial",
    format: "story",
    label: "Editorial",
    imageSrc: "/banner-templates/story-editorial.svg",
    frameClassName: "max-w-[360px]",
    frameStyle: { width: 360, minHeight: 640 },
    articleClassName: "aspect-[9/16]",
    overlayClassName:
      "bg-[linear-gradient(180deg,rgba(15,23,42,0.04),rgba(15,23,42,0.14)_22%,rgba(15,23,42,0.78)_68%,rgba(15,23,42,0.92))]",
    contentClassName: "justify-end pb-3",
    textClassName: "text-white",
    subtextToneClassName: "text-slate-100/95",
    headlineClassName: "max-w-[88%] text-[2.25rem] leading-[1.02]",
    subtextClassName: "max-w-[82%] text-[1rem] leading-8",
    ctaToneClassName: "bg-white text-slate-950",
    ctaClassName: "px-5 py-2.5 text-sm",
  },
  "story-minimal": {
    key: "story-minimal",
    format: "story",
    label: "Minimal",
    imageSrc: "/banner-templates/story-minimal.svg",
    frameClassName: "max-w-[360px]",
    frameStyle: { width: 360, minHeight: 640 },
    articleClassName: "aspect-[9/16]",
    overlayClassName:
      "bg-[linear-gradient(180deg,rgba(248,250,252,0.12),rgba(248,250,252,0.28)_20%,rgba(248,250,252,0.84)_66%,rgba(248,250,252,0.92))]",
    contentClassName: "justify-between pt-9 pb-6",
    textClassName: "text-slate-950",
    subtextToneClassName: "text-slate-700",
    headlineClassName: "max-w-[86%] text-[2.05rem] leading-[1.03]",
    subtextClassName: "max-w-[76%] text-[0.94rem] leading-7",
    ctaToneClassName: "bg-slate-950 text-white",
    ctaClassName: "px-6 py-3 text-[0.92rem]",
  },
};

const defaultTemplateKeyByFormat = {
  feed: "feed-editorial",
  story: "story-editorial",
};

export function getDefaultBannerTemplateKey(format = "feed") {
  return defaultTemplateKeyByFormat[format] ?? defaultTemplateKeyByFormat.feed;
}

export function getBannerTemplate(templateKey, format = "feed") {
  if (templateKey && bannerTemplates[templateKey]) {
    return bannerTemplates[templateKey];
  }

  return bannerTemplates[getDefaultBannerTemplateKey(format)];
}

export function listBannerTemplatesByFormat(format = "feed") {
  return Object.values(bannerTemplates).filter(
    (template) => template.format === format
  );
}
