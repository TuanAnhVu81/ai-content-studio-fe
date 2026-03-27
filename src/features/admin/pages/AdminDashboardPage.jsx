import { useQuery } from "@tanstack/react-query";
import { Activity, FileText, FolderKanban, Users } from "lucide-react";
import { Link } from "react-router-dom";

import { AppSpinner } from "@/components/common/AppSpinner";
import { buttonVariants } from "@/components/ui/button";
import { queryKeys } from "@/constants/queryKeys";
import { AdminHero } from "@/features/admin/components/AdminHero";
import { adminService } from "@/services/adminService";
import { getApiErrorMessage } from "@/utils/getApiErrorMessage";
import { cn } from "@/lib/utils";

function formatCount(value) {
  return new Intl.NumberFormat("en-US").format(value ?? 0);
}

function getCollectionCount(pageData) {
  return Math.max(pageData?.totalElements ?? 0, pageData?.content?.length ?? 0);
}

export function AdminDashboardPage() {
  const usersQuery = useQuery({
    queryKey: queryKeys.admin.users({ page: 0, size: 20 }),
    queryFn: () => adminService.getUsers({ page: 0, size: 20 }),
  });

  const campaignsQuery = useQuery({
    queryKey: queryKeys.admin.campaigns({ page: 0, size: 20, sort: "createdAt,desc" }),
    queryFn: () =>
      adminService.getCampaigns({ page: 0, size: 20, sort: "createdAt,desc" }),
  });

  const recentContentsQuery = useQuery({
    queryKey: queryKeys.admin.recentContents,
    queryFn: adminService.getRecentContents,
  });

  const aiUsageQuery = useQuery({
    queryKey: queryKeys.admin.aiStats({}),
    queryFn: () => adminService.getAiUsageStats({}),
  });

  const isLoading =
    usersQuery.isLoading ||
    campaignsQuery.isLoading ||
    recentContentsQuery.isLoading ||
    aiUsageQuery.isLoading;

  const error =
    usersQuery.error ||
    campaignsQuery.error ||
    recentContentsQuery.error ||
    aiUsageQuery.error;

  if (isLoading) {
    return <AppSpinner label="Loading admin dashboard..." className="min-h-[60vh]" />;
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300">
        {getApiErrorMessage(error, "Unable to load the admin dashboard.")}
      </div>
    );
  }

  const cards = [
    {
      label: "Users",
      value: formatCount(getCollectionCount(usersQuery.data)),
      description: "Total user accounts available to the admin workspace.",
      icon: Users,
      to: "/admin/users",
    },
    {
      label: "Campaigns",
      value: formatCount(getCollectionCount(campaignsQuery.data)),
      description: "Campaigns currently stored across every user workspace.",
      icon: FolderKanban,
      to: "/admin/campaigns",
    },
    {
      label: "Recent contents",
      value: formatCount(recentContentsQuery.data?.length),
      description: "Most recent content records available for moderation review.",
      icon: FileText,
      to: "/admin/contents",
    },
    {
      label: "AI tokens",
      value: formatCount(aiUsageQuery.data?.total_tokens),
      description: "Aggregate AI token usage across the selected reporting window.",
      icon: Activity,
      to: "/admin/ai-usage",
    },
  ];

  return (
    <div className="space-y-8">
      <AdminHero
        eyebrow="Admin control room"
        title="Monitor the platform before taking sensitive moderation actions."
        description="Use this dashboard as the jump-off point for account reviews, content moderation, campaign monitoring, and AI usage reporting."
        actions={
          <Link
            to="/admin/ai-usage"
            className={cn(
              buttonVariants({
                className:
                  "bg-slate-950 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200",
              })
            )}
          >
            Open AI usage
          </Link>
        }
      />

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <Link
              key={card.label}
              to={card.to}
              className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-xs uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                    {card.label}
                  </div>
                  <div className="mt-3 text-4xl font-semibold tracking-tight text-slate-900 dark:text-white">
                    {card.value}
                  </div>
                </div>
                <div className="rounded-2xl bg-slate-100 p-3 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                  <Icon className="size-5" />
                </div>
              </div>

              <p className="mt-4 text-sm leading-7 text-slate-600 dark:text-slate-300">
                {card.description}
              </p>
            </Link>
          );
        })}
      </section>
    </div>
  );
}
