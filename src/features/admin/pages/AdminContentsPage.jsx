import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ExternalLink, RefreshCw, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";

import { AppSpinner } from "@/components/common/AppSpinner";
import { Button, buttonVariants } from "@/components/ui/button";
import { queryKeys } from "@/constants/queryKeys";
import { AdminHero } from "@/features/admin/components/AdminHero";
import { AdminReasonDialog } from "@/features/admin/components/AdminReasonDialog";
import { AdminStatusBadge } from "@/features/admin/components/AdminStatusBadge";
import { adminService } from "@/services/adminService";
import { getApiErrorMessage } from "@/utils/getApiErrorMessage";

function formatDateTime(value) {
  if (!value) {
    return "--";
  }

  return format(new Date(value), "MMM d, yyyy HH:mm");
}

export function AdminContentsPage() {
  const queryClient = useQueryClient();
  const [dialogState, setDialogState] = useState({
    open: false,
    contentId: null,
    targetKeyword: "",
  });
  const [dialogError, setDialogError] = useState("");

  const recentContentsQuery = useQuery({
    queryKey: queryKeys.admin.recentContents,
    queryFn: adminService.getRecentContents,
  });

  const deleteMutation = useMutation({
    mutationFn: ({ contentId, reason }) => adminService.deleteContent(contentId, reason),
    onSuccess: async () => {
      setDialogError("");
      setDialogState({ open: false, contentId: null, targetKeyword: "" });
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.admin.recentContents }),
        queryClient.invalidateQueries({ queryKey: queryKeys.admin.campaigns({}) }),
      ]);
    },
    onError: (error) => {
      setDialogError(getApiErrorMessage(error, "Unable to hard delete content."));
    },
  });

  const contents = recentContentsQuery.data ?? [];

  const closeDialog = () => {
    if (deleteMutation.isPending) {
      return;
    }

    setDialogError("");
    setDialogState({ open: false, contentId: null, targetKeyword: "" });
  };

  return (
    <div className="space-y-8">
      <AdminHero
        eyebrow="Admin contents"
        title="Moderate the latest content records and hard delete when necessary."
        description="This moderation list surfaces the latest 50 content items, plus a required audit reason for destructive deletion."
        actions={
          <Button
            variant="outline"
            onClick={() => recentContentsQuery.refetch()}
            disabled={recentContentsQuery.isFetching}
          >
            <RefreshCw className="mr-2 size-4" />
            Refresh
          </Button>
        }
      />

      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        {recentContentsQuery.isLoading ? (
          <AppSpinner label="Loading recent contents..." className="min-h-[22rem]" />
        ) : recentContentsQuery.isError ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300">
            {getApiErrorMessage(
              recentContentsQuery.error,
              "Unable to load recent admin contents."
            )}
          </div>
        ) : contents.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-950/50 dark:text-slate-300">
            No recent content records available.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-800">
              <thead>
                <tr className="text-left text-xs uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                  <th className="pb-3 font-medium">Keyword</th>
                  <th className="pb-3 font-medium">Campaign</th>
                  <th className="pb-3 font-medium">Owner</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Created</th>
                  <th className="pb-3 font-medium">Preview</th>
                  <th className="pb-3 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {contents.map((content) => (
                  <tr key={content.id}>
                    <td className="py-4 align-top">
                      <div className="font-semibold text-slate-900 dark:text-white">
                        {content.target_keyword}
                      </div>
                    </td>
                    <td className="py-4 align-top text-slate-600 dark:text-slate-300">
                      {content.campaign_name}
                    </td>
                    <td className="py-4 align-top text-slate-600 dark:text-slate-300">
                      {content.owner_email}
                    </td>
                    <td className="py-4 align-top">
                      <AdminStatusBadge status={content.status} />
                    </td>
                    <td className="py-4 align-top text-slate-600 dark:text-slate-300">
                      {formatDateTime(content.created_at)}
                    </td>
                    <td className="max-w-xs py-4 align-top text-slate-600 dark:text-slate-300">
                      <p
                        className="overflow-hidden"
                        style={{
                          display: "-webkit-box",
                          WebkitBoxOrient: "vertical",
                          WebkitLineClamp: 3,
                        }}
                      >
                        {content.content_preview || "--"}
                      </p>
                    </td>
                    <td className="py-4 text-right align-top">
                      <div className="flex justify-end gap-2">
                        {content.banner_url ? (
                          <a
                            href={content.banner_url}
                            target="_blank"
                            rel="noreferrer"
                            className={buttonVariants({ variant: "outline" })}
                          >
                            <ExternalLink className="mr-2 size-4" />
                            Banner
                          </a>
                        ) : null}
                        <Button
                          variant="outline"
                          onClick={() => {
                            setDialogError("");
                            setDialogState({
                              open: true,
                              contentId: content.id,
                              targetKeyword: content.target_keyword,
                            });
                          }}
                        >
                          <Trash2 className="mr-2 size-4" />
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <AdminReasonDialog
        open={dialogState.open}
        title="Hard delete content"
        description={`Permanently delete "${dialogState.targetKeyword}". This action cannot be undone and will be written to the admin audit trail.`}
        confirmLabel="Confirm delete"
        isSubmitting={deleteMutation.isPending}
        errorMessage={dialogError}
        onCancel={closeDialog}
        onConfirm={(reason) =>
          deleteMutation.mutate({
            contentId: dialogState.contentId,
            reason,
          })
        }
      />
    </div>
  );
}
