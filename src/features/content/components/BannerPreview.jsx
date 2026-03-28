import { forwardRef } from "react";

import { getBannerTemplate } from "@/features/content/bannerTemplates";
import { cn } from "@/lib/utils";

export const BannerPreview = forwardRef(function BannerPreview(
  { bannerConfig },
  ref
) {
  const config = bannerConfig ?? {
    format: "feed",
    template_key: "feed-editorial",
    headline: "Untitled banner",
    subtext: "",
    cta: "Discover more",
  };

  const template = getBannerTemplate(config.template_key, config.format);
  const frameStyle = {
    ...template.frameStyle,
    width: "100%",
    maxWidth: template.frameStyle?.width ?? undefined,
    minHeight: undefined,
  };
  const headlineLength = (config.headline || "").length;
  const headlineClassName =
    config.format === "story"
      ? headlineLength > 46
        ? "text-[2rem] leading-[1.03]"
        : "text-[2.2rem] leading-[1.02]"
      : headlineLength > 70
        ? "text-[2.6rem] leading-[0.98]"
        : "text-[3rem] leading-[0.96]";

  return (
    <div className={cn("mx-auto w-full max-w-full min-w-0", template.frameClassName)}>
      <article
        ref={ref}
        style={frameStyle}
        translate="no"
        className={cn(
          "notranslate relative w-full overflow-hidden rounded-[2rem] border border-slate-200 bg-slate-950 shadow-[0_24px_80px_rgba(15,23,42,0.28)] dark:border-slate-700",
          template.articleClassName
        )}
      >
        <img
          src={template.imageSrc}
          alt={template.label}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className={cn("absolute inset-0", template.overlayClassName)} />

        <div
          className={cn(
            "relative flex h-full flex-col px-10",
            template.textClassName,
            template.contentClassName
          )}
        >
          <div className="space-y-5">
            <h3
              className={cn(
                "font-semibold tracking-tight drop-shadow-[0_16px_40px_rgba(15,23,42,0.22)]",
                template.headlineClassName,
                headlineClassName
              )}
            >
              {config.headline}
            </h3>

            {config.subtext ? (
              <p
                className={cn(
                  "drop-shadow-[0_12px_30px_rgba(15,23,42,0.16)]",
                  template.subtextToneClassName,
                  template.subtextClassName
                )}
              >
                {config.subtext}
              </p>
            ) : null}

            {config.cta ? (
              <div className="pt-3">
                <div
                  className={cn(
                    "inline-flex items-center justify-center whitespace-nowrap rounded-full font-semibold shadow-[0_12px_30px_rgba(15,23,42,0.16)]",
                    template.ctaToneClassName,
                    template.ctaClassName
                  )}
                >
                  {config.cta}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </article>
    </div>
  );
});
