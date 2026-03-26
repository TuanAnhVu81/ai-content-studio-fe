import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, LoaderCircle } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { buttonVariants } from "@/components/ui/button";
import { AppSpinner } from "@/components/common/AppSpinner";
import { queryKeys } from "@/constants/queryKeys";
import { ContentEditor } from "@/features/content/components/ContentEditor";
import { SeoSidebar } from "@/features/content/components/SeoSidebar";
import { useSeoAnalyzer } from "@/hooks/useSeoAnalyzer";
import { contentService } from "@/services/contentService";
import { normalizeGeneratedContent } from "@/utils/normalizeGeneratedContent";
import { getApiErrorMessage } from "@/utils/getApiErrorMessage";
import { cn } from "@/lib/utils";

function normalizeEditorDraft(content) {
  return {
    generatedText: normalizeGeneratedContent(content?.generated_text ?? ""),
    metaTitle: content?.seo_metadata?.meta_title ?? "",
    metaDescription: content?.seo_metadata?.meta_description ?? "",
  };
}

export function EditorPage() {
  const queryClient = useQueryClient();
  const { id } = useParams();
  const [draft, setDraft] = useState({
    generatedText: "",
    metaTitle: "",
    metaDescription: "",
  });
  const [submitError, setSubmitError] = useState("");
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const latestSavedRef = useRef(draft);

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
  }, [contentQuery.data]);

  const analysis = useSeoAnalyzer({
    htmlContent: draft.generatedText,
    keyword: contentQuery.data?.target_keyword ?? "",
    metaTitle: draft.metaTitle,
    metaDescription: draft.metaDescription,
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
                  {draft.metaTitle.length}/60 characters
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
                  {draft.metaDescription.length}/160 characters
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

        <SeoSidebar analysis={analysis} />
      </section>
    </div>
  );
}
