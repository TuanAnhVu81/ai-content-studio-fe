import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { RefreshCw } from "lucide-react";
import { useSearchParams } from "react-router-dom";

import { AppSpinner } from "@/components/common/AppSpinner";
import { Button } from "@/components/ui/button";
import { queryKeys } from "@/constants/queryKeys";
import { AdminHero } from "@/features/admin/components/AdminHero";
import { AdminStatusBadge } from "@/features/admin/components/AdminStatusBadge";
import { adminService } from "@/services/adminService";
import { getApiErrorMessage } from "@/utils/getApiErrorMessage";

const pageSize = 20;

function formatDateTime(value) {
  if (!value) {
    return "--";
  }

  return format(new Date(value), "MMM d, yyyy HH:mm");
}

export function AdminCampaignsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Math.max(Number(searchParams.get("page") ?? 0) || 0, 0);

  const campaignsQuery = useQuery({
    queryKey: queryKeys.admin.campaigns({ page, size: pageSize }),
    queryFn: () =>
      adminService.getCampaigns({
        page,
        size: pageSize,
        sort: "createdAt,desc",
      }),
  });

  const pageData = campaignsQuery.data;
  const campaigns = pageData?.content ?? [];

  const handlePageChange = (nextPage) => {
    const next = new URLSearchParams(searchParams);
    next.set("page", String(nextPage));
    setSearchParams(next);
  };

  return (
    <div className="space-y-8">
      <AdminHero
        eyebrow="Admin campaigns"
        title="Monitor campaign ownership and content volume across the workspace."
        description="Review campaign ownership, lifecycle state, content volume, and creation timeline across the workspace."
        actions={
          <Button
            variant="outline"
            onClick={() => campaignsQuery.refetch()}
            disabled={campaignsQuery.isFetching}
          >
            <RefreshCw className="mr-2 size-4" />
            Refresh
          </Button>
        }
      />

      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        {campaignsQuery.isLoading ? (
          <AppSpinner label="Loading campaigns..." className="min-h-[22rem]" />
        ) : campaignsQuery.isError ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300">
            {getApiErrorMessage(campaignsQuery.error, "Unable to load admin campaigns.")}
          </div>
        ) : campaigns.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-950/50 dark:text-slate-300">
            No campaigns available.
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-800">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                    <th className="pb-3 font-medium">Campaign</th>
                    <th className="pb-3 font-medium">Owner</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium">Contents</th>
                    <th className="pb-3 font-medium">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {campaigns.map((campaign) => (
                    <tr key={campaign.id}>
                      <td className="py-4 align-top">
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {campaign.name}
                        </div>
                      </td>
                      <td className="py-4 align-top text-slate-600 dark:text-slate-300">
                        {campaign.owner_email}
                      </td>
                      <td className="py-4 align-top">
                        <AdminStatusBadge status={campaign.status} />
                      </td>
                      <td className="py-4 align-top text-slate-600 dark:text-slate-300">
                        {campaign.content_count}
                      </td>
                      <td className="py-4 align-top text-slate-600 dark:text-slate-300">
                        {formatDateTime(campaign.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-5 flex flex-col gap-4 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/40 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Showing page {page + 1} of {Math.max(pageData?.totalPages ?? 1, 1)}.
              </p>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(Math.max(page - 1, 0))}
                  disabled={pageData?.first}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  onClick={() =>
                    handlePageChange(
                      Math.min(page + 1, Math.max((pageData?.totalPages ?? 1) - 1, 0))
                    )
                  }
                  disabled={pageData?.last}
                >
                  Next
                </Button>
              </div>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
