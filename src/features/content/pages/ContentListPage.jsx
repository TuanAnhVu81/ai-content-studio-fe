import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowUpRight, CalendarDays, FolderKanban, Sparkles, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useCallback, useMemo, useState, useTransition } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

import { buttonVariants } from "@/components/ui/button";
import { queryKeys } from "@/constants/queryKeys";
import { GenerateForm } from "@/features/content/components/GenerateForm";
import { contentService } from "@/services/contentService";
import { campaignService } from "@/services/campaignService";
import { getApiErrorMessage } from "@/utils/getApiErrorMessage";
import { cn } from "@/lib/utils";

const pageSize = 10;

function formatRelativeDate(value) {
  if (!value) {
    return "Unknown";
  }

  try {
    return formatDistanceToNow(new Date(value), { addSuffix: true });
  } catch {
    return "Unknown";
  }
}

function ContentStatusBadge({ status }) {
  const classes = {
    DRAFT:
      "border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200",
    PUBLISHED:
      "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300",
    ARCHIVED:
      "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300",
  };

  const label = status ?? "DRAFT";

  return (
    <span
      className={cn(
        "inline-flex rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em]",
        classes[label] ?? classes.DRAFT
      )}
    >
      {label}
    </span>
  );
}

function ContentCard({ content, onDelete, isDeleting }) {
  return (
    <article
      className={cn(
        "rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900",
        isDeleting && "pointer-events-none opacity-50"
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-3">
          <ContentStatusBadge status={content.status} />
          <div className="space-y-2">
            <h3 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-white">
              {content.target_keyword}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              {content.campaign_name || "Campaign unavailable"}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onDelete}
            className={cn(
              buttonVariants({
                variant: "outline",
                size: "icon-sm",
                className:
                  "border-slate-200 bg-white text-rose-500 hover:bg-rose-50 hover:text-rose-600 dark:border-slate-700 dark:bg-slate-950 dark:text-rose-300 dark:hover:bg-rose-950/30",
              })
            )}
            aria-label={`Delete ${content.target_keyword}`}
          >
            <Trash2 className="size-4" />
          </button>
          <Link
            to={`/editor/${content.id}`}
            className={cn(
              buttonVariants({
                variant: "outline",
                size: "icon-sm",
                className:
                  "border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-950",
              })
            )}
          >
            <ArrowUpRight className="size-4" />
          </Link>
        </div>
      </div>

      <div className="mt-6 rounded-[1.5rem] bg-slate-50 p-4 dark:bg-slate-950/60">
        <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
          <FolderKanban className="size-4 text-brand-primary" />
          <span>{content.prompt_config.platform || "Unknown platform"}</span>
        </div>
        <div className="mt-3 flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
          <CalendarDays className="size-4 text-sky-500" />
          <span>Created {formatRelativeDate(content.created_at)}</span>
        </div>
      </div>
    </article>
  );
}

function ContentCardSkeleton() {
  return (
    <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="animate-pulse space-y-5">
        <div className="h-6 w-24 rounded-full bg-slate-200 dark:bg-slate-800" />
        <div className="space-y-3">
          <div className="h-6 w-2/3 rounded bg-slate-200 dark:bg-slate-800" />
          <div className="h-4 w-1/2 rounded bg-slate-200 dark:bg-slate-800" />
        </div>
        <div className="h-20 rounded-[1.5rem] bg-slate-200 dark:bg-slate-800" />
      </div>
    </div>
  );
}

export function ContentListPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const [submitError, setSubmitError] = useState("");
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [, startTransition] = useTransition();

  const selectedCampaignId = searchParams.get("campaignId") ?? "";
  const page = Math.max(Number(searchParams.get("page") ?? 0) || 0, 0);

  const campaignsQuery = useQuery({
    queryKey: queryKeys.campaigns.list({ contentPicker: true }),
    queryFn: () =>
      campaignService.getCampaigns({
        page: 0,
        size: 100,
        sort: "createdAt,desc",
      }),
  });

  const campaigns = useMemo(
    () => campaignsQuery.data?.content ?? [],
    [campaignsQuery.data]
  );

  const effectiveCampaignId = selectedCampaignId || campaigns[0]?.id || "";

  const contentQuery = useQuery({
    queryKey: queryKeys.contents.byCampaign(effectiveCampaignId, {
      page,
      size: pageSize,
    }),
    queryFn: () =>
      contentService.getContents({
        campaignId: effectiveCampaignId,
        page,
        size: pageSize,
        sort: "createdAt,desc",
      }),
    enabled: Boolean(effectiveCampaignId),
  });

  const generateMutation = useMutation({
    mutationFn: contentService.generateContent,
    onSuccess: async (content) => {
      setSubmitError("");
      setFeedbackMessage("Content draft generated successfully.");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.contents.all }),
        queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.user }),
      ]);
      navigate(`/editor/${content.id}`);
    },
    onError: (error) => {
      setSubmitError(
        getApiErrorMessage(error, "Unable to generate content. Please try again.")
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: contentService.deleteContent,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.contents.all }),
        queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.user }),
      ]);
    },
  });

  const updateSearchParam = useCallback((key, value) => {
    startTransition(() => {
      const next = new URLSearchParams(searchParams);

      if (!value) {
        next.delete(key);
      } else {
        next.set(key, String(value));
      }

      if (key !== "page") {
        next.set("page", "0");
      }

      setSearchParams(next);
    });
  }, [searchParams, setSearchParams]);

  const handleCampaignChange = useCallback(
    (campaignId) => {
      updateSearchParam("campaignId", campaignId);
    },
    [updateSearchParam]
  );

  return (
    <div className="space-y-8">
      <section className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
        <GenerateForm
          campaigns={campaigns}
          initialCampaignId={effectiveCampaignId}
          onCampaignChange={handleCampaignChange}
          submitError={submitError}
          isSubmitting={generateMutation.isPending}
          onSubmit={(values) => generateMutation.mutate(values)}
        />

        <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="border-b border-slate-200 px-6 py-5 dark:border-slate-800">
            <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-slate-500 dark:bg-slate-800 dark:text-slate-300">
              Workspace
            </span>
            <h2 className="mt-4 text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
              Review generated drafts by campaign.
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
              Stay focused on one campaign while moving between draft generation and
              manual editing.
            </p>
          </div>
          <div className="space-y-4 p-6">
            <div className="rounded-[1.75rem] bg-slate-950 p-5 text-white">
              <div className="text-xs uppercase tracking-[0.18em] text-slate-500">
                Selected campaign
              </div>
              <div className="mt-2 text-2xl font-semibold">
                {campaigns.find((campaign) => campaign.id === effectiveCampaignId)?.name ??
                  "Choose a campaign"}
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-4 text-sm leading-7 text-slate-600 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-300">
              Generate a draft here, then jump straight into the editor to refine the
              copy, improve SEO, and save the final version.
            </div>
          </div>
        </section>
      </section>

      {feedbackMessage ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300">
          {feedbackMessage}
        </div>
      ) : null}

      <section className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
              Content drafts
            </h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              Recent generated content scoped to the selected campaign.
            </p>
          </div>
          <Link to="/campaigns" className={cn(buttonVariants({ variant: "outline" }))}>
            Manage campaigns
          </Link>
        </div>

        {campaignsQuery.isLoading ? (
          <div className="grid gap-5 lg:grid-cols-2">
            {Array.from({ length: 2 }).map((_, index) => (
              <ContentCardSkeleton key={index} />
            ))}
          </div>
        ) : campaigns.length === 0 ? (
          <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-900">
            <div className="mx-auto max-w-xl space-y-3">
              <h3 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
                Create a campaign before generating content.
              </h3>
              <p className="text-sm leading-7 text-slate-600 dark:text-slate-300">
                Create a campaign first so new drafts can be grouped, reviewed, and
                managed in the right workspace.
              </p>
              <Link
                to="/campaigns"
                className={cn(
                  buttonVariants({
                    className:
                      "bg-slate-950 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200",
                  })
                )}
              >
                <Sparkles className="mr-2 size-4" />
                Go to campaigns
              </Link>
            </div>
          </div>
        ) : contentQuery.isLoading ? (
          <div className="grid gap-5 lg:grid-cols-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <ContentCardSkeleton key={index} />
            ))}
          </div>
        ) : contentQuery.isError ? (
          <div className="rounded-[2rem] border border-red-200 bg-red-50 p-6 text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300">
            {getApiErrorMessage(contentQuery.error, "Unable to load content drafts.")}
          </div>
        ) : (contentQuery.data?.content ?? []).length === 0 ? (
          <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-900">
            <div className="mx-auto max-w-xl space-y-3">
              <h3 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
                No content drafts for this campaign yet.
              </h3>
              <p className="text-sm leading-7 text-slate-600 dark:text-slate-300">
                Use the generate form above to create the first content draft.
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="grid gap-5 lg:grid-cols-2">
              {contentQuery.data.content.map((content) => (
                <ContentCard
                  key={content.id}
                  content={content}
                  isDeleting={
                    deleteMutation.isPending && deleteMutation.variables === content.id
                  }
                  onDelete={() => {
                    if (
                      window.confirm(
                        "Are you sure you want to delete this content draft?"
                      )
                    ) {
                      deleteMutation.mutate(content.id);
                    }
                  }}
                />
              ))}
            </div>

            <div className="flex flex-col gap-4 rounded-[2rem] border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Showing page {page + 1} of {Math.max(contentQuery.data.totalPages ?? 1, 1)}.
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  className={cn(buttonVariants({ variant: "outline" }))}
                  onClick={() => updateSearchParam("page", Math.max(page - 1, 0))}
                  disabled={contentQuery.data.first}
                >
                  Previous
                </button>
                <button
                  type="button"
                  className={cn(buttonVariants({ variant: "outline" }))}
                  onClick={() =>
                    updateSearchParam(
                      "page",
                      Math.min(
                        page + 1,
                        Math.max((contentQuery.data.totalPages ?? 1) - 1, 0)
                      )
                    )
                  }
                  disabled={contentQuery.data.last}
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
