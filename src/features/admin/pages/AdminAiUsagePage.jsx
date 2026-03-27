import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Award, RefreshCw } from "lucide-react";
import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { AppSpinner } from "@/components/common/AppSpinner";
import { Button } from "@/components/ui/button";
import { queryKeys } from "@/constants/queryKeys";
import { AdminHero } from "@/features/admin/components/AdminHero";
import { adminService } from "@/services/adminService";
import { getApiErrorMessage } from "@/utils/getApiErrorMessage";
import { cn } from "@/lib/utils";

function formatCount(value) {
  return new Intl.NumberFormat("en-US").format(value ?? 0);
}

function toDateTimeRange(startDate, endDate) {
  return {
    from: startDate ? `${startDate}T00:00:00` : undefined,
    to: endDate ? `${endDate}T23:59:59` : undefined,
  };
}

function formatDateInput(value) {
  return value ? format(new Date(value), "yyyy-MM-dd") : "";
}

export function AdminAiUsagePage() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const dateRange = useMemo(() => toDateTimeRange(startDate, endDate), [endDate, startDate]);

  const statsQuery = useQuery({
    queryKey: queryKeys.admin.aiStats(dateRange),
    queryFn: () => adminService.getAiUsageStats(dateRange),
  });

  const topUsersQuery = useQuery({
    queryKey: queryKeys.admin.topUsers(dateRange),
    queryFn: () => adminService.getTopUsers(dateRange),
  });

  const stats = statsQuery.data;
  const topUsers = topUsersQuery.data ?? [];

  return (
    <div className="space-y-8">
      <AdminHero
        eyebrow="Admin AI usage"
        title="Track token consumption across models and the most active users."
        description="Review aggregate token totals, model distribution, and the users driving the highest AI activity."
        actions={
          <div className="flex flex-wrap gap-3">
            <input
              type="date"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />
            <input
              type="date"
              value={endDate}
              min={startDate || undefined}
              onChange={(event) => setEndDate(event.target.value)}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />
            <Button
              variant="outline"
              onClick={() => {
                setStartDate("");
                setEndDate("");
              }}
            >
              Reset
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                statsQuery.refetch();
                topUsersQuery.refetch();
              }}
              disabled={statsQuery.isFetching || topUsersQuery.isFetching}
            >
              <RefreshCw className="mr-2 size-4" />
              Refresh
            </Button>
          </div>
        }
      />

      {statsQuery.isLoading ? (
        <AppSpinner label="Loading AI usage..." className="min-h-[20rem]" />
      ) : statsQuery.isError ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300">
          {getApiErrorMessage(statsQuery.error, "Unable to load AI usage statistics.")}
        </div>
      ) : (
        <>
          <section className="grid gap-5 lg:grid-cols-3">
            {[
              {
                label: "Prompt tokens",
                value: formatCount(stats?.total_prompt_tokens),
              },
              {
                label: "Response tokens",
                value: formatCount(stats?.total_response_tokens),
              },
              {
                label: "Total tokens",
                value: formatCount(stats?.total_tokens),
              },
            ].map((card) => (
              <div
                key={card.label}
                className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="text-xs uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                  {card.label}
                </div>
                <div className="mt-3 text-4xl font-semibold tracking-tight text-slate-900 dark:text-white">
                  {card.value}
                </div>
                <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
                  Range: {formatDateInput(stats?.from) || "start"} to{" "}
                  {formatDateInput(stats?.to) || "now"}.
                </p>
              </div>
            ))}
          </section>

          <section className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="space-y-2">
                <div className="text-xs uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                  Tokens by model
                </div>
                <h2 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
                  Model distribution
                </h2>
              </div>

              <div className="mt-6 h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats?.tokens_by_model ?? []}>
                    <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.15} />
                    <XAxis dataKey="model_name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip
                      formatter={(value) => [formatCount(value), "tokens"]}
                      contentStyle={{
                        borderRadius: "1rem",
                        border: "1px solid rgba(148,163,184,0.2)",
                      }}
                    />
                    <Bar
                      dataKey="total_tokens"
                      fill="url(#tokensGradient)"
                      radius={[12, 12, 0, 0]}
                    />
                    <defs>
                      <linearGradient id="tokensGradient" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#3b82f6" />
                        <stop offset="100%" stopColor="#8b5cf6" />
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="space-y-2">
                <div className="text-xs uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                  Top users
                </div>
                <h2 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
                  Highest token usage
                </h2>
              </div>

              {topUsersQuery.isLoading ? (
                <AppSpinner label="Loading top users..." className="min-h-[16rem]" />
              ) : topUsersQuery.isError ? (
                <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300">
                  {getApiErrorMessage(topUsersQuery.error, "Unable to load top users.")}
                </div>
              ) : (
                <div className="mt-5 space-y-3">
                  {topUsers.map((entry, index) => (
                    <div
                      key={entry.user_id}
                      className="flex items-start justify-between rounded-[1.5rem] border border-slate-200 bg-slate-50 px-4 py-4 dark:border-slate-800 dark:bg-slate-950/40"
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={cn(
                            "mt-0.5 flex size-9 items-center justify-center rounded-full text-sm font-semibold",
                            index < 3
                              ? "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
                              : "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-200"
                          )}
                        >
                          {index < 3 ? <Award className="size-4" /> : index + 1}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900 dark:text-white">
                            {entry.full_name || "Unnamed user"}
                          </div>
                          <div className="text-sm text-slate-600 dark:text-slate-300">
                            {entry.email}
                          </div>
                          <div className="mt-1 text-xs uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                            Prompt {formatCount(entry.prompt_tokens)} | Response{" "}
                            {formatCount(entry.response_tokens)}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-xs uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                          Total
                        </div>
                        <div className="mt-1 text-xl font-semibold text-slate-900 dark:text-white">
                          {formatCount(entry.total_tokens)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
