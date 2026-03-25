import { cn } from "@/lib/utils";

const statusClasses = {
  DRAFT:
    "border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200",
  ACTIVE:
    "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300",
  ARCHIVED:
    "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300",
};

export function StatusBadge({ status }) {
  const label = status ?? "DRAFT";

  return (
    <span
      className={cn(
        "inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em]",
        statusClasses[label] ?? statusClasses.DRAFT
      )}
    >
      {label}
    </span>
  );
}
