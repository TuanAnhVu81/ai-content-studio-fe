import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowUpRight, CalendarDays, Target, Trash2, UsersRound } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Link } from "react-router-dom";

import { Button, buttonVariants } from "@/components/ui/button";
import { queryKeys } from "@/constants/queryKeys";
import { StatusBadge } from "@/features/campaign/components/StatusBadge";
import { campaignService } from "@/services/campaignService";
import { cn } from "@/lib/utils";

function formatRelativeDate(value) {
  if (!value) {
    return "Unknown";
  }

  try {
    return formatDistanceToNow(new Date(value), { addSuffix: true });
  } catch (error) {
    return "Unknown";
  }
}

export function CampaignCard({ campaign }) {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: () => campaignService.deleteCampaign(campaign.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.campaigns.all });
    },
  });

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this campaign?")) {
      deleteMutation.mutate();
    }
  };

  return (
    <article
      className={cn(
        "group relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900",
        deleteMutation.isPending && "pointer-events-none opacity-50"
      )}
    >
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brand-primary via-sky-500 to-brand-secondary opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <div className="flex items-start justify-between gap-4">
        <div className="space-y-3">
          <StatusBadge status={campaign.status} />
          <div className="space-y-2">
            <h3 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-white">
              {campaign.name}
            </h3>
            <p className="text-sm leading-7 text-slate-600 dark:text-slate-300">
              {campaign.metadata?.goal || "No campaign goal has been added yet."}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 gap-2">
          <Button
            variant="outline"
            size="icon-sm"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="border-slate-200 bg-white/80 text-rose-500 hover:bg-rose-50 hover:text-rose-600 dark:border-slate-700 dark:bg-slate-950 dark:hover:bg-rose-950/30"
            aria-label={`Delete ${campaign.name}`}
          >
            <Trash2 className="size-4" />
          </Button>

          <Link
            to={`/campaigns/${campaign.id}`}
            className={cn(
              buttonVariants({
                variant: "outline",
                size: "icon-sm",
                className:
                  "border-slate-200 bg-white/80 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-800",
              })
            )}
            aria-label={`Edit ${campaign.name}`}
          >
            <ArrowUpRight className="size-4" />
          </Link>
        </div>
      </div>

      <div className="mt-6 grid gap-3 rounded-[1.5rem] bg-slate-50 p-4 dark:bg-slate-950/70">
        <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
          <Target className="size-4 text-brand-primary" />
          <span>{campaign.metadata?.goal || "Goal not specified"}</span>
        </div>
        <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
          <UsersRound className="size-4 text-brand-secondary" />
          <span>{campaign.metadata?.target_audience || "Audience not specified"}</span>
        </div>
        <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
          <CalendarDays className="size-4 text-sky-500" />
          <span>Created {formatRelativeDate(campaign.created_at)}</span>
        </div>
      </div>
    </article>
  );
}
