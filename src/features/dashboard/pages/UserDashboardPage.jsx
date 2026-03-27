import { useQuery } from "@tanstack/react-query";
import { BarChart3, FileText, FolderKanban, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

import { buttonVariants } from "@/components/ui/button";
import { AppSpinner } from "@/components/common/AppSpinner";
import { queryKeys } from "@/constants/queryKeys";
import { MonthlyUsageBar } from "@/features/dashboard/components/MonthlyUsageBar";
import { RecentActivityList } from "@/features/dashboard/components/RecentActivityList";
import { StatsCard } from "@/features/dashboard/components/StatsCard";
import { useAuth } from "@/hooks/useAuth";
import { dashboardService } from "@/services/dashboardService";
import { getApiErrorMessage } from "@/utils/getApiErrorMessage";
import { cn } from "@/lib/utils";

function formatCount(value) {
  return new Intl.NumberFormat("en-US").format(value ?? 0);
}

export function UserDashboardPage() {
  const { user } = useAuth();

  const dashboardQuery = useQuery({
    queryKey: queryKeys.dashboard.user,
    queryFn: dashboardService.getUserDashboard,
    staleTime: 0,
    refetchOnMount: "always",
  });

  const recentContents = dashboardQuery.data?.recent_contents ?? [];

  if (dashboardQuery.isLoading) {
    return <AppSpinner label="Loading dashboard..." className="min-h-[60vh]" />;
  }

  if (dashboardQuery.isError) {
    return (
      <div className="rounded-[2rem] border border-red-200 bg-red-50 p-6 text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300">
        {getApiErrorMessage(dashboardQuery.error, "Unable to load dashboard data.")}
      </div>
    );
  }

  const dashboard = dashboardQuery.data;

  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="grid gap-8 p-6 lg:grid-cols-[1.15fr_0.85fr] lg:p-8">
          <div className="space-y-5">
            <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-slate-500 dark:bg-slate-800 dark:text-slate-300">
              User dashboard
            </span>
            <div className="space-y-3">
              <h1 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
                {user?.full_name
                  ? `Welcome back, ${user.full_name}.`
                  : "See what your workspace produced recently."}
              </h1>
              <p className="max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-300">
                Monitor campaign coverage, content output and recent AI activity from one
                workspace before moving into campaign management or the editor flow.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/contents"
                className={cn(
                  buttonVariants({
                    className:
                      "bg-slate-950 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200",
                  })
                )}
              >
                <Sparkles className="mr-2 size-4" />
                Create new content
              </Link>
              <Link to="/campaigns" className={cn(buttonVariants({ variant: "outline" }))}>
                <FolderKanban className="mr-2 size-4" />
                Manage campaigns
              </Link>
            </div>
          </div>

          <div className="grid gap-4 rounded-[1.75rem] bg-slate-950 p-5 text-white">
            <div>
              <div className="text-xs uppercase tracking-[0.18em] text-slate-500">
                Rolling usage
              </div>
              <div className="mt-2 text-2xl font-semibold">
                {formatCount(dashboard.total_tokens_used_30_days)} tokens
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-[1.25rem] border border-white/10 bg-white/5 p-4">
                <div className="text-xs uppercase tracking-[0.16em] text-slate-500">
                  Active scope
                </div>
                <div className="mt-2 text-3xl font-semibold">
                  {formatCount(dashboard.total_campaigns)} campaigns
                </div>
              </div>
              <div className="rounded-[1.25rem] border border-white/10 bg-white/5 p-4">
                <div className="text-xs uppercase tracking-[0.16em] text-slate-500">
                  Recent content
                </div>
                <div className="mt-2 text-3xl font-semibold">
                  {recentContents.length}/5
                </div>
              </div>
            </div>
            <p className="text-sm leading-7 text-slate-300">
              Keep an eye on campaign activity, recent draft output, and rolling AI
              usage before moving into the editor or campaign workspace.
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-3">
        <StatsCard
          eyebrow="Campaigns"
          title="Total campaigns"
          value={formatCount(dashboard.total_campaigns)}
          description="Track how many workspaces are currently available to support upcoming content generation."
          icon={FolderKanban}
        />
        <StatsCard
          eyebrow="Contents"
          title="Total contents"
          value={formatCount(dashboard.total_contents)}
          description="See how much AI-assisted copy has already been generated and stored under your account."
          icon={FileText}
          accent="from-sky-500 via-brand-primary to-brand-secondary"
        />
        <StatsCard
          eyebrow="Quick action"
          title="Create new content"
          value="Generate"
          description="Open the content workspace to generate a draft, then move into the editor with a real content id."
          icon={BarChart3}
          accent="from-brand-secondary via-brand-primary to-sky-500"
          action={
            <Link
              to="/contents"
              className={cn(
                buttonVariants({
                  className:
                    "bg-slate-950 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200",
                })
              )}
            >
              Launch editor
            </Link>
          }
        />
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.4fr_0.9fr]">
        <RecentActivityList contents={recentContents} />
        <MonthlyUsageBar totalTokensUsed={dashboard.total_tokens_used_30_days} />
      </section>
    </div>
  );
}
