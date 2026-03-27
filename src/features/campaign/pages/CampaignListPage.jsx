import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, RefreshCw } from "lucide-react";
import { useState, useTransition } from "react";
import { useSearchParams } from "react-router-dom";

import { buttonVariants } from "@/components/ui/button";
import { queryKeys } from "@/constants/queryKeys";
import { CampaignCard } from "@/features/campaign/components/CampaignCard";
import { CampaignForm } from "@/features/campaign/components/CampaignForm";
import { CampaignSlideOver } from "@/features/campaign/components/CampaignSlideOver";
import { campaignService } from "@/services/campaignService";
import { getApiErrorMessage } from "@/utils/getApiErrorMessage";
import { cn } from "@/lib/utils";

const statusFilters = ["ALL", "ACTIVE", "ARCHIVED", "DRAFT"];
const pageSize = 10;

function CampaignCardSkeleton() {
  return (
    <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="animate-pulse space-y-5">
        <div className="h-6 w-24 rounded-full bg-slate-200 dark:bg-slate-800" />
        <div className="space-y-3">
          <div className="h-6 w-3/4 rounded bg-slate-200 dark:bg-slate-800" />
          <div className="h-4 w-full rounded bg-slate-200 dark:bg-slate-800" />
          <div className="h-4 w-5/6 rounded bg-slate-200 dark:bg-slate-800" />
        </div>
        <div className="rounded-[1.5rem] bg-slate-50 p-4 dark:bg-slate-950/70">
          <div className="space-y-3">
            <div className="h-4 rounded bg-slate-200 dark:bg-slate-800" />
            <div className="h-4 rounded bg-slate-200 dark:bg-slate-800" />
            <div className="h-4 w-2/3 rounded bg-slate-200 dark:bg-slate-800" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function CampaignListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [, startTransition] = useTransition();
  const queryClient = useQueryClient();

  const status = searchParams.get("status") ?? "ALL";
  const page = Math.max(Number(searchParams.get("page") ?? 0) || 0, 0);

  const campaignQuery = useQuery({
    queryKey: queryKeys.campaigns.list({ status, page, size: pageSize }),
    queryFn: () =>
      campaignService.getCampaigns({
        status,
        page,
        size: pageSize,
        sort: "createdAt,desc",
      }),
  });

  const createMutation = useMutation({
    mutationFn: campaignService.createCampaign,
    onSuccess: async () => {
      setSubmitError("");
      setFeedbackMessage("Campaign created successfully.");
      setIsFormOpen(false);

      startTransition(() => {
        const next = new URLSearchParams(searchParams);
        next.set("page", "0");
        setSearchParams(next);
      });

      await queryClient.invalidateQueries({ queryKey: queryKeys.campaigns.all });
    },
    onError: (error) => {
      setSubmitError(getApiErrorMessage(error, "Unable to create campaign."));
    },
  });

  const campaignsPage = campaignQuery.data;
  const campaigns = campaignsPage?.content ?? [];

  const updateSearchParam = (key, value) => {
    startTransition(() => {
      const next = new URLSearchParams(searchParams);

      if (value === undefined || value === null || value === "ALL") {
        next.delete(key);
      } else {
        next.set(key, String(value));
      }

      if (key !== "page") {
        next.set("page", "0");
      }

      setSearchParams(next);
    });
  };

  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="grid gap-8 p-6 lg:grid-cols-[1.15fr_0.85fr] lg:p-8">
          <div className="space-y-5">
            <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-slate-500 dark:bg-slate-800 dark:text-slate-300">
              Campaign management
            </span>
            <div className="space-y-3">
              <h1 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
                Organize campaigns before content production begins.
              </h1>
              <p className="max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-300">
                Filter campaigns by lifecycle status, review campaign goals, and create
                new workspaces for upcoming content production.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                className={cn(
                  buttonVariants({
                    className:
                      "bg-slate-950 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200",
                  })
                )}
                onClick={() => {
                  setFeedbackMessage("");
                  setSubmitError("");
                  setIsFormOpen(true);
                }}
              >
                <Plus className="mr-1 size-4" />
                New campaign
              </button>
              <button
                type="button"
                className={cn(buttonVariants({ variant: "outline" }))}
                onClick={() =>
                  queryClient.invalidateQueries({ queryKey: queryKeys.campaigns.all })
                }
              >
                <RefreshCw className="mr-1 size-4" />
                Refresh
              </button>
            </div>
          </div>

          <div className="grid gap-4 rounded-[1.75rem] bg-slate-950 p-5 text-white">
            <div>
              <div className="text-xs uppercase tracking-[0.18em] text-slate-500">
                Current filter
              </div>
              <div className="mt-2 text-2xl font-semibold">{status}</div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-[1.25rem] border border-white/10 bg-white/5 p-4">
                <div className="text-xs uppercase tracking-[0.16em] text-slate-500">
                  Total campaigns
                </div>
                <div className="mt-2 text-3xl font-semibold">
                  {campaignsPage?.totalElements ?? "--"}
                </div>
              </div>
              <div className="rounded-[1.25rem] border border-white/10 bg-white/5 p-4">
                <div className="text-xs uppercase tracking-[0.16em] text-slate-500">
                  Page
                </div>
                <div className="mt-2 text-3xl font-semibold">
                  {page + 1}/{Math.max(campaignsPage?.totalPages ?? 1, 1)}
                </div>
              </div>
            </div>
            <p className="text-sm leading-7 text-slate-300">
              Keep campaign planning, audience notes, and publishing goals organized
              before moving into content generation.
            </p>
          </div>
        </div>
      </section>

      {feedbackMessage ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300">
          {feedbackMessage}
        </div>
      ) : null}

      <section className="space-y-6">
        <div className="flex flex-wrap gap-2">
          {statusFilters.map((filter) => {
            const isActive = filter === status;

            return (
              <button
                key={filter}
                type="button"
                onClick={() => updateSearchParam("status", filter)}
                className={cn(
                  "rounded-full border px-4 py-2 text-sm font-medium transition",
                  isActive
                    ? "border-slate-950 bg-slate-950 text-white dark:border-white dark:bg-white dark:text-slate-950"
                    : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                )}
              >
                {filter}
              </button>
            );
          })}
        </div>

        {campaignQuery.isLoading ? (
          <div className="grid gap-5 md:grid-cols-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <CampaignCardSkeleton key={index} />
            ))}
          </div>
        ) : campaignQuery.isError ? (
          <div className="rounded-[2rem] border border-red-200 bg-red-50 p-6 text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300">
            {getApiErrorMessage(campaignQuery.error, "Unable to load campaigns.")}
          </div>
        ) : campaigns.length === 0 ? (
          <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-900">
            <div className="mx-auto max-w-xl space-y-3">
              <h2 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
                No campaigns found for this filter.
              </h2>
              <p className="text-sm leading-7 text-slate-600 dark:text-slate-300">
                Create a campaign to start organizing goals, audience metadata and
                future AI content around one workspace.
              </p>
              <button
                type="button"
                className={cn(
                  buttonVariants({
                    className:
                      "mt-2 bg-slate-950 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200",
                  })
                )}
                onClick={() => setIsFormOpen(true)}
              >
                <Plus className="mr-1 size-4" />
                Create campaign
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="grid gap-5 md:grid-cols-2">
              {campaigns.map((campaign) => (
                <CampaignCard key={campaign.id} campaign={campaign} />
              ))}
            </div>

            <div className="flex flex-col gap-4 rounded-[2rem] border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Showing page {page + 1} of {Math.max(campaignsPage?.totalPages ?? 1, 1)}.
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  className={cn(buttonVariants({ variant: "outline" }))}
                  onClick={() => updateSearchParam("page", Math.max(page - 1, 0))}
                  disabled={campaignsPage?.first}
                >
                  Previous
                </button>
                <button
                  type="button"
                  className={cn(buttonVariants({ variant: "outline" }))}
                  onClick={() =>
                    updateSearchParam(
                      "page",
                      Math.min(page + 1, Math.max((campaignsPage?.totalPages ?? 1) - 1, 0))
                    )
                  }
                  disabled={campaignsPage?.last}
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </section>

      <CampaignSlideOver
        open={isFormOpen}
        title="Create a new campaign"
        description="Use the exact payload shape expected by the backend without disturbing the campaign list context."
        onClose={() => {
          setSubmitError("");
          setIsFormOpen(false);
        }}
      >
        <CampaignForm
          mode="create"
          title="Create a new campaign"
          description="Goal and target audience remain optional metadata fields."
          initialValues={null}
          isSubmitting={createMutation.isPending}
          submitLabel="Create campaign"
          errorMessage={submitError}
          embedded
          onCancel={() => {
            setSubmitError("");
            setIsFormOpen(false);
          }}
          onSubmit={(values) => createMutation.mutate(values)}
        />
      </CampaignSlideOver>
    </div>
  );
}
