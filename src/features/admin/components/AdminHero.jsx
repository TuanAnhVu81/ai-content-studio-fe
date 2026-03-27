export function AdminHero({ eyebrow, title, description, actions = null }) {
  return (
    <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="grid gap-6 p-6 lg:grid-cols-[1.2fr_0.8fr] lg:p-8">
        <div className="space-y-4">
          <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-slate-500 dark:bg-slate-800 dark:text-slate-300">
            {eyebrow}
          </span>
          <div className="space-y-3">
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              {title}
            </h1>
            <p className="max-w-3xl text-sm leading-7 text-slate-600 dark:text-slate-300">
              {description}
            </p>
          </div>
        </div>

        {actions ? (
          <div className="flex flex-wrap items-start justify-end gap-3">{actions}</div>
        ) : null}
      </div>
    </section>
  );
}
