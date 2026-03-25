import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/features/campaign/components/StatusBadge";

const statusOptions = ["DRAFT", "ACTIVE", "ARCHIVED"];

const campaignSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, "Campaign name must be at least 3 characters")
    .max(100, "Campaign name must be 100 characters or fewer"),
  status: z.enum(["DRAFT", "ACTIVE", "ARCHIVED"]),
  metadata: z.object({
    goal: z.string().max(255, "Goal must be 255 characters or fewer").optional(),
    target_audience: z
      .string()
      .max(255, "Target audience must be 255 characters or fewer")
      .optional(),
  }),
});

function getDefaultValues(initialValues) {
  return {
    name: initialValues?.name ?? "",
    status: initialValues?.status ?? "DRAFT",
    metadata: {
      goal: initialValues?.metadata?.goal ?? "",
      target_audience: initialValues?.metadata?.target_audience ?? "",
    },
  };
}

export function CampaignForm({
  mode,
  initialValues,
  isSubmitting,
  onCancel,
  onSubmit,
  submitLabel,
  errorMessage,
  title,
  description,
  embedded = false,
}) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(campaignSchema),
    defaultValues: getDefaultValues(initialValues),
  });

  useEffect(() => {
    reset(getDefaultValues(initialValues));
  }, [initialValues, reset]);

  const selectedStatus = watch("status");

  return (
    <section
      className={
        embedded
          ? "rounded-[1.5rem] border border-slate-200 bg-slate-50/80 p-5 dark:border-slate-800 dark:bg-slate-900/70 sm:p-6"
          : "rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-7"
      }
    >
      {!embedded ? (
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-3">
            <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-slate-500 dark:bg-slate-800 dark:text-slate-300">
              {mode === "edit" ? "Edit campaign" : "Create campaign"}
            </span>
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
                {title}
              </h2>
              <p className="text-sm leading-7 text-slate-600 dark:text-slate-300">
                {description}
              </p>
            </div>
          </div>
          <StatusBadge status={selectedStatus} />
        </div>
      ) : (
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <div className="text-sm font-medium text-slate-900 dark:text-white">{title}</div>
            <div className="mt-1 text-sm text-slate-600 dark:text-slate-300">{description}</div>
          </div>
          <StatusBadge status={selectedStatus} />
        </div>
      )}

      <form className={embedded ? "space-y-5" : "mt-8 space-y-5"} onSubmit={handleSubmit(onSubmit)}>
        <label className="block space-y-2">
          <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
            Campaign name
          </span>
          <input
            type="text"
            placeholder="Summer launch campaign"
            {...register("name")}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
          />
          {errors.name?.message ? (
            <p className="text-sm text-red-600 dark:text-red-400">{errors.name.message}</p>
          ) : null}
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
            Status
          </span>
          <select
            {...register("status")}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
          >
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          {errors.status?.message ? (
            <p className="text-sm text-red-600 dark:text-red-400">{errors.status.message}</p>
          ) : null}
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
            Goal
          </span>
          <textarea
            rows={4}
            placeholder="Describe the campaign objective and desired outcome."
            {...register("metadata.goal")}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
          />
          {errors.metadata?.goal?.message ? (
            <p className="text-sm text-red-600 dark:text-red-400">
              {errors.metadata.goal.message}
            </p>
          ) : null}
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
            Target audience
          </span>
          <textarea
            rows={4}
            placeholder="Who should this campaign reach?"
            {...register("metadata.target_audience")}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
          />
          {errors.metadata?.target_audience?.message ? (
            <p className="text-sm text-red-600 dark:text-red-400">
              {errors.metadata.target_audience.message}
            </p>
          ) : null}
        </label>

        {errorMessage ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300">
            {errorMessage}
          </div>
        ) : null}

        <div className="flex flex-wrap gap-3">
          <Button
            type="submit"
            className="h-11 bg-slate-950 px-5 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <LoaderCircle className="mr-2 size-4 animate-spin" />
                Saving...
              </>
            ) : (
              submitLabel
            )}
          </Button>
          {onCancel ? (
            <Button type="button" variant="outline" className="h-11 px-5" onClick={onCancel}>
              Cancel
            </Button>
          ) : null}
        </div>
      </form>
    </section>
  );
}
