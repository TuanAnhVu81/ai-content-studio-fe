export function StatsCard({
  eyebrow,
  title,
  value,
  description,
  icon: Icon,
  action,
  accent = "from-brand-primary via-sky-500 to-brand-secondary",
}) {
  return (
    <article className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${accent}`} />

      <div className="flex items-start justify-between gap-4">
        <div className="space-y-3">
          <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-slate-500 dark:bg-slate-800 dark:text-slate-300">
            {eyebrow}
          </span>
          <div className="space-y-2">
            <h2 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-white">
              {title}
            </h2>
            <div className="text-4xl font-semibold tracking-tight text-slate-900 dark:text-white">
              {value}
            </div>
          </div>
        </div>

        {Icon ? (
          <div className="flex size-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
            <Icon className="size-5" />
          </div>
        ) : null}
      </div>

      <div className="mt-6 space-y-4">
        <p className="text-sm leading-7 text-slate-600 dark:text-slate-300">
          {description}
        </p>
        {action}
      </div>
    </article>
  );
}
