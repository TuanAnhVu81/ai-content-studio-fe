function formatTokenCount(value) {
  return new Intl.NumberFormat("en-US").format(value ?? 0);
}

function getUsageTone(totalTokensUsed) {
  if (totalTokensUsed >= 20000) {
    return "High throughput";
  }

  if (totalTokensUsed >= 5000) {
    return "Healthy activity";
  }

  if (totalTokensUsed > 0) {
    return "Just getting started";
  }

  return "No AI usage yet";
}

function getUsageWidth(totalTokensUsed) {
  if (totalTokensUsed <= 0) {
    return 8;
  }

  const scaledValue = Math.log10(totalTokensUsed + 1) / 5;
  return Math.max(14, Math.min(100, Math.round(scaledValue * 100)));
}

export function MonthlyUsageBar({ totalTokensUsed }) {
  const usageWidth = getUsageWidth(totalTokensUsed);

  return (
    <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="border-b border-slate-200 px-6 py-5 dark:border-slate-800">
        <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-slate-500 dark:bg-slate-800 dark:text-slate-300">
          Monthly usage
        </span>
        <h2 className="mt-4 text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
          Track the AI workload handled in the last 30 days.
        </h2>
        <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
          Use this view to understand how active the workspace has been recently and
          how much AI generation volume has been handled over the last month.
        </p>
      </div>

      <div className="space-y-6 px-6 py-6">
        <div className="rounded-[1.75rem] bg-slate-950 p-5 text-white">
          <div className="text-xs uppercase tracking-[0.18em] text-slate-500">
            Tokens used
          </div>
          <div className="mt-3 text-4xl font-semibold tracking-tight">
            {formatTokenCount(totalTokensUsed)}
          </div>
          <div className="mt-2 text-sm text-slate-300">
            {getUsageTone(totalTokensUsed)} across the trailing 30-day window.
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-medium uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
            <span>Usage meter</span>
            <span>Last 30 days</span>
          </div>
          <div className="h-3 rounded-full bg-slate-100 dark:bg-slate-800">
            <div
              className="h-3 rounded-full bg-gradient-to-r from-brand-primary via-sky-500 to-brand-secondary transition-[width] duration-500"
              style={{ width: `${usageWidth}%` }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
