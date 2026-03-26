import { CheckCircle2, CircleX } from "lucide-react";

import { cn } from "@/lib/utils";

const statusTone = {
  good: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300",
  warning:
    "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300",
  poor: "border-red-200 bg-red-50 text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300",
  neutral:
    "border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200",
};

function getStatus(analysis) {
  if (!analysis) {
    return { label: "Not analyzed", tone: "neutral" };
  }
  if (analysis.score >= 70) {
    return { label: "Strong", tone: "good" };
  }
  if (analysis.score >= 40) {
    return { label: "Needs work", tone: "warning" };
  }
  return { label: "Weak", tone: "poor" };
}

function ChecklistItem({ label, passed }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl bg-slate-50 px-4 py-3 text-sm dark:bg-slate-950/60">
      <span className="text-slate-700 dark:text-slate-200">{label}</span>
      <span
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em]",
          passed ? statusTone.good : statusTone.poor
        )}
      >
        {passed ? <CheckCircle2 className="size-3.5" /> : <CircleX className="size-3.5" />}
        {passed ? "Pass" : "Not met"}
      </span>
    </div>
  );
}

export function SeoSidebar({ analysis }) {
  const status = getStatus(analysis);
  const score = analysis?.score ?? null;

  return (
    <aside className="space-y-5">
      <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="border-b border-slate-200 px-6 py-5 dark:border-slate-800">
          <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-slate-500 dark:bg-slate-800 dark:text-slate-300">
            SEO analysis
          </span>
          <div className="mt-4 flex items-center justify-between gap-4">
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
              SEO sidebar
            </h2>
            <span
              className={cn(
                "rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em]",
                statusTone[status.tone]
              )}
            >
              {status.label}
            </span>
          </div>
        </div>

        <div className="space-y-5 p-6">
          <div className="rounded-[1.75rem] bg-slate-950 p-5 text-white">
            <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Score</div>
            <div className="mt-3 text-4xl font-semibold tracking-tight">
              {score ?? "--"}/100
            </div>
            <div className="mt-4 h-3 rounded-full bg-white/10">
              <div
                className="h-3 rounded-full bg-gradient-to-r from-brand-primary via-sky-500 to-brand-secondary transition-[width] duration-500"
                style={{ width: `${score ?? 0}%` }}
              />
            </div>
          </div>

          <div className="space-y-3">
            <ChecklistItem label="Keyword appears in H1" passed={analysis?.has_h1 ?? false} />
            <ChecklistItem
              label="Keyword density between 1% and 3%"
              passed={
                analysis
                  ? analysis.keyword_density >= 1 && analysis.keyword_density <= 3
                  : false
              }
            />
            <ChecklistItem label="At least two H2 headings" passed={analysis?.has_h2 ?? false} />
            <ChecklistItem
              label="Content length above 300 words"
              passed={(analysis?.word_count ?? 0) >= 300}
            />
            <ChecklistItem label="Meta title is valid" passed={analysis?.meta_title_valid ?? false} />
            <ChecklistItem
              label="Meta description is valid"
              passed={analysis?.meta_description_valid ?? false}
            />
          </div>
        </div>
      </section>

      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h3 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-white">
          Suggestions
        </h3>
        {analysis?.suggestions?.length ? (
          <ul className="mt-4 space-y-3">
            {analysis.suggestions.map((suggestion) => (
              <li
                key={suggestion}
                className="rounded-2xl bg-slate-50 px-4 py-3 text-sm leading-7 text-slate-700 dark:bg-slate-950/60 dark:text-slate-300"
              >
                {suggestion}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 rounded-2xl bg-slate-50 px-4 py-3 text-sm leading-7 text-slate-600 dark:bg-slate-950/60 dark:text-slate-300">
            Add content or meta fields to start the client-side SEO analysis.
          </p>
        )}
      </section>
    </aside>
  );
}
