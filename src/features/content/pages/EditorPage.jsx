import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Download, ExternalLink, LoaderCircle } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { buttonVariants } from "@/components/ui/button";
import { AppSpinner } from "@/components/common/AppSpinner";
import { queryKeys } from "@/constants/queryKeys";
import {
  getBannerTemplate,
  getDefaultBannerTemplateKey,
  listBannerTemplatesByFormat,
} from "@/features/content/bannerTemplates";
import { BannerPreview } from "@/features/content/components/BannerPreview";
import { ContentEditor } from "@/features/content/components/ContentEditor";
import { SeoSidebar } from "@/features/content/components/SeoSidebar";
import {
  createBannerConfig,
  normalizeBannerConfig,
} from "@/features/content/utils/bannerConfig";
import { useBannerExport } from "@/hooks/useBannerExport";
import { useSeoAnalyzer } from "@/hooks/useSeoAnalyzer";
import { contentService } from "@/services/contentService";
import { normalizeGeneratedContent } from "@/utils/normalizeGeneratedContent";
import { normalizeLength } from "@/utils/seoCalculator";
import { getApiErrorMessage } from "@/utils/getApiErrorMessage";
import { cn } from "@/lib/utils";

function normalizeEditorDraft(content) {
  return {
    generatedText: normalizeGeneratedContent(content?.generated_text ?? ""),
    metaTitle: content?.seo_metadata?.meta_title ?? "",
    metaDescription: content?.seo_metadata?.meta_description ?? "",
  };
}

function buildBannerState(content, draft, format = "feed") {
  const savedConfig = normalizeBannerConfig(content?.banner_config);

  if (savedConfig) {
    return savedConfig;
  }

  return createBannerConfig({
    htmlContent: draft.generatedText,
    metaDescription: draft.metaDescription,
    fallbackHeadline: content?.target_keyword || "Campaign banner",
    format,
  });
}

export function EditorPage() {
  const queryClient = useQueryClient();
  const { id } = useParams();
  const bannerRef = useRef(null);
  const [draft, setDraft] = useState({
    generatedText: "",
    metaTitle: "",
    metaDescription: "",
  });
  const [submitError, setSubmitError] = useState("");
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [bannerConfig, setBannerConfig] = useState(() =>
    createBannerConfig({
      htmlContent: "",
      metaDescription: "",
      fallbackHeadline: "Campaign banner",
      format: "feed",
    })
  );
  const latestSavedRef = useRef(draft);
  const { isExporting, exportAndSave } = useBannerExport();

  const contentQuery = useQuery({
    queryKey: queryKeys.contents.detail(id),
    queryFn: () => contentService.getContent(id),
    enabled: Boolean(id),
  });

  useEffect(() => {
    if (!contentQuery.data) {
      return;
    }

    const normalizedDraft = normalizeEditorDraft(contentQuery.data);
    setDraft(normalizedDraft);
    latestSavedRef.current = normalizedDraft;
    setBannerConfig(buildBannerState(contentQuery.data, normalizedDraft));
  }, [contentQuery.data]);

  const analysis = useSeoAnalyzer({
    htmlContent: draft.generatedText,
    keyword: contentQuery.data?.target_keyword ?? "",
    metaTitle: draft.metaTitle,
    metaDescription: draft.metaDescription,
    platform: contentQuery.data?.prompt_config?.platform ?? "",
  });

  const isDirty = useMemo(
    () => JSON.stringify(draft) !== JSON.stringify(latestSavedRef.current),
    [draft]
  );

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (!isDirty) {
        return undefined;
      }

      event.preventDefault();
      event.returnValue = "";
      return "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  const saveMutation = useMutation({
    mutationFn: (payload) => contentService.updateContent(id, payload),
    onSuccess: async (nextContent) => {
      const nextDraft = normalizeEditorDraft(nextContent);
      latestSavedRef.current = nextDraft;
      setDraft(nextDraft);
      setSubmitError("");
      setFeedbackMessage("Content saved successfully.");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.contents.detail(id) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.contents.all }),
        queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.user }),
      ]);
    },
    onError: (error) => {
      setSubmitError(getApiErrorMessage(error, "Unable to save content changes."));
    },
  });

  if (contentQuery.isLoading) {
    return <AppSpinner label="Loading editor..." className="min-h-[60vh]" />;
  }

  if (contentQuery.isError || !contentQuery.data) {
    return (
      <div className="space-y-5">
        <Link to="/contents" className={cn(buttonVariants({ variant: "outline" }))}>
          <ArrowLeft className="mr-2 size-4" />
          Back to content workspace
        </Link>
        <div className="rounded-[2rem] border border-red-200 bg-red-50 p-6 text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300">
          {getApiErrorMessage(contentQuery.error, "Unable to load the content editor.")}
        </div>
      </div>
    );
  }

  const content = contentQuery.data;
  const currentTemplate = getBannerTemplate(
    bannerConfig.template_key,
    bannerConfig.format
  );
  const availableTemplates = listBannerTemplatesByFormat(bannerConfig.format);

  const handleBannerFormatChange = (format) => {
    setBannerConfig((currentConfig) => ({
      ...currentConfig,
      format,
      template_key: getDefaultBannerTemplateKey(format),
    }));
  };

  const handleBannerReset = () => {
    setBannerConfig(
      createBannerConfig({
        htmlContent: draft.generatedText,
        metaDescription: draft.metaDescription,
        fallbackHeadline: content.target_keyword || "Campaign banner",
        format: bannerConfig.format,
      })
    );
  };

  const handleBannerExport = async () => {
    setSubmitError("");
    setFeedbackMessage("");

    try {
      await exportAndSave(bannerRef, id, {
        fileName: content.target_keyword || content.campaign_name || "content-banner",
        template: bannerConfig.format,
        bannerConfig,
      });
      setFeedbackMessage("Banner exported, uploaded, and saved successfully.");
    } catch (error) {
      setSubmitError(getApiErrorMessage(error, "Unable to export and save banner."));
    }
  };

  return (
    <div className="space-y-6">
      <nav
        aria-label="Breadcrumb"
        className="flex flex-wrap items-center gap-2 text-sm text-slate-500 dark:text-slate-400"
      >
        <Link
          to="/contents"
          className="transition hover:text-slate-900 dark:hover:text-white"
        >
          Contents
        </Link>
        <span>/</span>
        <span className="max-w-[220px] truncate">{content.campaign_name || "Campaign"}</span>
        <span>/</span>
        <span className="max-w-[260px] truncate text-slate-700 dark:text-slate-200">
          {content.target_keyword || "Editor"}
        </span>
      </nav>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link to="/contents" className={cn(buttonVariants({ variant: "outline" }))}>
          <ArrowLeft className="mr-2 size-4" />
          Back to content workspace
        </Link>

        <div className="flex items-center gap-3">
          {isDirty ? (
            <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300">
              Unsaved changes
            </span>
          ) : (
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300">
              Saved
            </span>
          )}
          <button
            type="button"
            className={cn(
              buttonVariants({
                className:
                  "bg-slate-950 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200",
              })
            )}
            onClick={() =>
              saveMutation.mutate({
                generated_text: draft.generatedText,
                seo_metadata: analysis,
              })
            }
            disabled={saveMutation.isPending || !draft.generatedText.trim()}
          >
            {saveMutation.isPending ? (
              <>
                <LoaderCircle className="mr-2 size-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save content"
            )}
          </button>
        </div>
      </div>

      {feedbackMessage ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300">
          {feedbackMessage}
        </div>
      ) : null}

      {submitError ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300">
          {submitError}
        </div>
      ) : null}

      <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="grid gap-8 p-6 xl:grid-cols-[1.15fr_0.85fr] xl:p-8">
          <div className="space-y-3">
            <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-slate-500 dark:bg-slate-800 dark:text-slate-300">
              Editor workspace
            </span>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">
              {content.target_keyword || "Untitled content"}
            </h1>
            <p className="text-sm leading-7 text-slate-600 dark:text-slate-300">
              Campaign: {content.campaign_name || "Unknown campaign"} | Platform:{" "}
              {content.prompt_config.platform || "Unknown"} | Tone:{" "}
              {content.prompt_config.tone || "Unknown"}
            </p>
          </div>

          <div className="rounded-[1.75rem] bg-slate-950 p-5 text-white">
            <div className="text-xs uppercase tracking-[0.18em] text-slate-500">
              Prompt config
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-[1.25rem] border border-white/10 bg-white/5 p-4">
                <div className="text-xs uppercase tracking-[0.16em] text-slate-500">
                  Language
                </div>
                <div className="mt-2 text-lg font-semibold">
                  {content.prompt_config.language || "Unknown"}
                </div>
              </div>
              <div className="rounded-[1.25rem] border border-white/10 bg-white/5 p-4">
                <div className="text-xs uppercase tracking-[0.16em] text-slate-500">
                  Length
                </div>
                <div className="mt-2 text-lg font-semibold">
                  {content.prompt_config.length || "auto"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.35fr_0.75fr]">
        <div className="space-y-5">
          <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="grid gap-5">
              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
                  Meta title
                </span>
                <input
                  type="text"
                  value={draft.metaTitle}
                  maxLength={60}
                  onChange={(event) =>
                    setDraft((currentDraft) => ({
                      ...currentDraft,
                      metaTitle: event.target.value,
                    }))
                  }
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {normalizeLength(draft.metaTitle)}/60 characters
                </div>
              </label>

              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
                  Meta description
                </span>
                <textarea
                  rows={4}
                  value={draft.metaDescription}
                  maxLength={160}
                  onChange={(event) =>
                    setDraft((currentDraft) => ({
                      ...currentDraft,
                      metaDescription: event.target.value,
                    }))
                  }
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {normalizeLength(draft.metaDescription)}/160 characters
                </div>
              </label>
            </div>
          </section>

          <ContentEditor
            value={draft.generatedText}
            onChange={(generatedText) =>
              setDraft((currentDraft) => ({
                ...currentDraft,
                generatedText,
              }))
            }
          />
        </div>

        <div className="space-y-5">
          <SeoSidebar analysis={analysis} />
        </div>
      </section>

      <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="border-b border-slate-200 px-6 py-5 dark:border-slate-800">
          <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-slate-500 dark:bg-slate-800 dark:text-slate-300">
            Banner preview
          </span>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
                Export a campaign creative from this draft.
              </h2>
              <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">
                Preview the creative on a real template, fine-tune the banner
                copy, then export a ready-to-share asset for this content record.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 p-1 dark:border-slate-700 dark:bg-slate-950/60">
              {["feed", "story"].map((templateOption) => {
                const isActive = bannerConfig.format === templateOption;

                return (
                  <button
                    key={templateOption}
                    type="button"
                    onClick={() => handleBannerFormatChange(templateOption)}
                    className={cn(
                      "rounded-full px-4 py-2 text-sm font-semibold transition",
                      isActive
                        ? "bg-slate-950 text-white dark:bg-white dark:text-slate-950"
                        : "text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
                    )}
                  >
                    {templateOption === "feed" ? "Feed" : "Story"}
                  </button>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {content.banner_url ? (
                <a
                  href={content.banner_url}
                  target="_blank"
                  rel="noreferrer"
                  className={cn(buttonVariants({ variant: "outline" }))}
                >
                  <ExternalLink className="mr-2 size-4" />
                  Open saved banner
                </a>
              ) : null}
              <button
                type="button"
                className={cn(
                  buttonVariants({
                    className:
                      "bg-slate-950 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200",
                  })
                )}
                onClick={handleBannerExport}
                disabled={
                  isExporting ||
                  !draft.generatedText.trim() ||
                  !bannerConfig.headline.trim()
                }
              >
                {isExporting ? (
                  <>
                    <LoaderCircle className="mr-2 size-4 animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 size-4" />
                    Export & save banner
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
              Style
            </span>
            <div className="flex flex-wrap gap-2">
              {availableTemplates.map((templateOption) => {
                const isActive = bannerConfig.template_key === templateOption.key;

                return (
                  <button
                    key={templateOption.key}
                    type="button"
                    onClick={() =>
                      setBannerConfig((currentConfig) => ({
                        ...currentConfig,
                        template_key: templateOption.key,
                      }))
                    }
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-sm font-medium transition",
                      isActive
                        ? "border-slate-950 bg-slate-950 text-white dark:border-white dark:bg-white dark:text-slate-950"
                        : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-slate-600 dark:hover:text-white"
                    )}
                  >
                    {templateOption.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid gap-5 xl:grid-cols-[minmax(340px,0.88fr)_minmax(0,1.12fr)]">
            <section className="space-y-4 rounded-[1.75rem] border border-slate-200 bg-slate-50/70 p-5 dark:border-slate-800 dark:bg-slate-950/40">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div className="max-w-[24rem] xl:max-w-[20rem] 2xl:max-w-[24rem]">
                  <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                    Banner copy
                  </h3>
                  <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">
                    Adjust the banner headline, supporting copy, and CTA
                    without changing the article body.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleBannerReset}
                  className={cn(
                    buttonVariants({ variant: "outline", size: "sm" }),
                    "self-start whitespace-nowrap"
                  )}
                >
                  Refresh from content
                </button>
              </div>

              <div className="grid gap-4">
                <label className="block space-y-2">
                  <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
                    Headline
                  </span>
                  <textarea
                    rows={4}
                    value={bannerConfig.headline}
                    maxLength={180}
                    onChange={(event) =>
                      setBannerConfig((currentConfig) => ({
                        ...currentConfig,
                        headline: event.target.value,
                      }))
                    }
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  />
                </label>

                <label className="block space-y-2">
                  <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
                    Supporting copy
                  </span>
                  <textarea
                    rows={4}
                    value={bannerConfig.subtext}
                    maxLength={240}
                    onChange={(event) =>
                      setBannerConfig((currentConfig) => ({
                        ...currentConfig,
                        subtext: event.target.value,
                      }))
                    }
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  />
                </label>

                <label className="block space-y-2">
                  <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
                    CTA label
                  </span>
                  <input
                    type="text"
                    value={bannerConfig.cta}
                    maxLength={80}
                    onChange={(event) =>
                      setBannerConfig((currentConfig) => ({
                        ...currentConfig,
                        cta: event.target.value,
                      }))
                    }
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  />
                </label>

                <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
                  Active template:{" "}
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {currentTemplate.label}
                  </span>
                </div>
              </div>
            </section>

            <div className="min-w-0 overflow-hidden">
              <BannerPreview ref={bannerRef} bannerConfig={bannerConfig} />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
