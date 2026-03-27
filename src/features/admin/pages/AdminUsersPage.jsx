import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { RefreshCw, Search } from "lucide-react";
import { format } from "date-fns";
import { useEffect, useState, useTransition } from "react";
import { useSearchParams } from "react-router-dom";

import { AppSpinner } from "@/components/common/AppSpinner";
import { Button, buttonVariants } from "@/components/ui/button";
import { queryKeys } from "@/constants/queryKeys";
import { AdminHero } from "@/features/admin/components/AdminHero";
import { AdminReasonDialog } from "@/features/admin/components/AdminReasonDialog";
import { AdminStatusBadge } from "@/features/admin/components/AdminStatusBadge";
import { useAuth } from "@/hooks/useAuth";
import { adminService } from "@/services/adminService";
import { getApiErrorMessage } from "@/utils/getApiErrorMessage";
import { cn } from "@/lib/utils";

const pageSize = 20;
const statusFilters = ["ALL", "ACTIVE", "INACTIVE"];

function formatDateTime(value) {
  if (!value) {
    return "--";
  }

  return format(new Date(value), "MMM d, yyyy HH:mm");
}

export function AdminUsersPage() {
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [emailInput, setEmailInput] = useState(searchParams.get("email") ?? "");
  const [dialogState, setDialogState] = useState({
    open: false,
    userId: null,
    nextStatus: null,
    userEmail: "",
  });
  const [dialogError, setDialogError] = useState("");
  const [, startTransition] = useTransition();

  const email = searchParams.get("email") ?? "";
  const status = searchParams.get("status") ?? "ALL";
  const page = Math.max(Number(searchParams.get("page") ?? 0) || 0, 0);

  useEffect(() => {
    setEmailInput(email);
  }, [email]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const normalizedValue = emailInput.trim();
      if (normalizedValue === email) {
        return;
      }

      startTransition(() => {
        const next = new URLSearchParams(searchParams);

        if (normalizedValue) {
          next.set("email", normalizedValue);
        } else {
          next.delete("email");
        }

        next.set("page", "0");
        setSearchParams(next);
      });
    }, 300);

    return () => window.clearTimeout(timeoutId);
  }, [email, emailInput, searchParams, setSearchParams, startTransition]);

  const usersQuery = useQuery({
    queryKey: queryKeys.admin.users({ email, status, page, size: pageSize }),
    queryFn: () =>
      adminService.getUsers({
        email,
        status,
        page,
        size: pageSize,
      }),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ userId, nextStatus, reason }) =>
      adminService.updateUserStatus(userId, { status: nextStatus, reason }),
    onSuccess: async () => {
      setDialogError("");
      setDialogState({ open: false, userId: null, nextStatus: null, userEmail: "" });
      await queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
    onError: (error) => {
      setDialogError(getApiErrorMessage(error, "Unable to update user status."));
    },
  });

  const pageData = usersQuery.data;
  const users = pageData?.content ?? [];

  const handleStatusFilterChange = (nextStatus) => {
    startTransition(() => {
      const next = new URLSearchParams(searchParams);

      if (nextStatus === "ALL") {
        next.delete("status");
      } else {
        next.set("status", nextStatus);
      }

      next.set("page", "0");
      setSearchParams(next);
    });
  };

  const handlePageChange = (nextPage) => {
    startTransition(() => {
      const next = new URLSearchParams(searchParams);
      next.set("page", String(nextPage));
      setSearchParams(next);
    });
  };

  const closeDialog = () => {
    if (updateStatusMutation.isPending) {
      return;
    }

    setDialogError("");
    setDialogState({ open: false, userId: null, nextStatus: null, userEmail: "" });
  };

  return (
    <div className="space-y-8">
      <AdminHero
        eyebrow="Admin users"
        title="Review user accounts and apply status changes with audit reasons."
        description="Search by email, filter by account status, and record an explicit admin reason for every account action."
        actions={
          <>
            <Button
              variant="outline"
              onClick={() => queryClient.invalidateQueries({ queryKey: ["admin", "users"] })}
            >
              <RefreshCw className="mr-2 size-4" />
              Refresh
            </Button>
          </>
        }
      />

      <section className="space-y-5 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full max-w-md">
            <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={emailInput}
              onChange={(event) => setEmailInput(event.target.value)}
              placeholder="Search by user email"
              className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-900 shadow-sm outline-none transition focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {statusFilters.map((filter) => {
              const isActive = filter === status;

              return (
                <button
                  key={filter}
                  type="button"
                  onClick={() => handleStatusFilterChange(filter)}
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
        </div>

        {usersQuery.isLoading ? (
          <AppSpinner label="Loading users..." className="min-h-[22rem]" />
        ) : usersQuery.isError ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300">
            {getApiErrorMessage(usersQuery.error, "Unable to load admin users.")}
          </div>
        ) : users.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-950/50 dark:text-slate-300">
            No users matched this filter.
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-800">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                    <th className="pb-3 font-medium">User</th>
                    <th className="pb-3 font-medium">Roles</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium">Created</th>
                    <th className="pb-3 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {users.map((adminUser) => {
                    const isCurrentUser = adminUser.id === currentUser?.id;
                    const nextStatus =
                      adminUser.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";

                    return (
                      <tr key={adminUser.id}>
                        <td className="py-4 align-top">
                          <div className="space-y-1">
                            <div className="font-semibold text-slate-900 dark:text-white">
                              {adminUser.full_name || "Unnamed user"}
                            </div>
                            <div className="text-slate-600 dark:text-slate-300">
                              {adminUser.email}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 align-top text-slate-600 dark:text-slate-300">
                          {(adminUser.roles ?? []).join(", ") || "--"}
                        </td>
                        <td className="py-4 align-top">
                          <AdminStatusBadge status={adminUser.status} />
                        </td>
                        <td className="py-4 align-top text-slate-600 dark:text-slate-300">
                          {formatDateTime(adminUser.created_at)}
                        </td>
                        <td className="py-4 text-right align-top">
                          <button
                            type="button"
                            disabled={isCurrentUser}
                            className={cn(
                              buttonVariants({ variant: "outline" }),
                              isCurrentUser ? "cursor-not-allowed opacity-50" : ""
                            )}
                            onClick={() => {
                              setDialogError("");
                              setDialogState({
                                open: true,
                                userId: adminUser.id,
                                nextStatus,
                                userEmail: adminUser.email,
                              });
                            }}
                          >
                            {adminUser.status === "ACTIVE" ? "Deactivate" : "Activate"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-4 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/40 sm:flex-row sm:items-center sm:justify-between">
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

      <AdminReasonDialog
        open={dialogState.open}
        title={`${dialogState.nextStatus === "INACTIVE" ? "Deactivate" : "Activate"} user`}
        description={`Confirm the status change for ${dialogState.userEmail}. This reason will be written to the admin audit trail.`}
        confirmLabel={
          dialogState.nextStatus === "INACTIVE" ? "Confirm deactivation" : "Confirm activation"
        }
        isSubmitting={updateStatusMutation.isPending}
        errorMessage={dialogError}
        onCancel={closeDialog}
        onConfirm={(reason) =>
          updateStatusMutation.mutate({
            userId: dialogState.userId,
            nextStatus: dialogState.nextStatus,
            reason,
          })
        }
      />
    </div>
  );
}
