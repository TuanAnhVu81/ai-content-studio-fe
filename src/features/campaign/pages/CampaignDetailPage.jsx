import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";

import { buttonVariants } from "@/components/ui/button";
import { queryKeys } from "@/constants/queryKeys";
import { CampaignForm } from "@/features/campaign/components/CampaignForm";
import { campaignService } from "@/services/campaignService";
import { cn } from "@/lib/utils";
import { getApiErrorMessage } from "@/utils/getApiErrorMessage";

export function CampaignDetailPage() {
  const queryClient = useQueryClient();
  const { id } = useParams();
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [submitError, setSubmitError] = useState("");

  const campaignQuery = useQuery({
    queryKey: queryKeys.campaigns.detail(id),
    queryFn: () => campaignService.getCampaign(id),
    enabled: Boolean(id),
  });

  const updateMutation = useMutation({
    mutationFn: (values) => campaignService.updateCampaign(id, values),
    onSuccess: async () => {
      setSubmitError("");
      setFeedbackMessage("Campaign updated successfully.");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.campaigns.all }),
        queryClient.invalidateQueries({ queryKey: queryKeys.campaigns.detail(id) }),
      ]);
    },
    onError: (error) => {
      setSubmitError(getApiErrorMessage(error, "Unable to update campaign."));
    },
  });

  if (campaignQuery.isLoading) {
    return (
      <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="animate-pulse space-y-4">
          <div className="h-6 w-32 rounded-full bg-slate-200 dark:bg-slate-800" />
          <div className="h-10 w-1/2 rounded bg-slate-200 dark:bg-slate-800" />
          <div className="h-4 w-3/4 rounded bg-slate-200 dark:bg-slate-800" />
          <div className="h-64 rounded-[2rem] bg-slate-200 dark:bg-slate-800" />
        </div>
      </div>
    );
  }

  if (campaignQuery.isError || !campaignQuery.data) {
    return (
      <div className="space-y-5">
        <Link to="/campaigns" className={cn(buttonVariants({ variant: "outline" }))}>
          <ArrowLeft className="mr-1 size-4" />
          Back to campaigns
        </Link>
        <div className="rounded-[2rem] border border-red-200 bg-red-50 p-6 text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300">
          {getApiErrorMessage(campaignQuery.error, "Unable to load campaign details.")}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3">
        <Link to="/campaigns" className={cn(buttonVariants({ variant: "outline" }))}>
          <ArrowLeft className="mr-1 size-4" />
          Back to campaigns
        </Link>
      </div>

      {feedbackMessage ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300">
          {feedbackMessage}
        </div>
      ) : null}

      <CampaignForm
        mode="edit"
        title={`Edit ${campaignQuery.data.name}`}
        description="Update the campaign name, lifecycle status, and supporting metadata before generating new content."
        initialValues={campaignQuery.data}
        isSubmitting={updateMutation.isPending}
        submitLabel="Save changes"
        errorMessage={submitError}
        onCancel={() => navigate("/campaigns")}
        onSubmit={(values) => updateMutation.mutate(values)}
      />
    </div>
  );
}
