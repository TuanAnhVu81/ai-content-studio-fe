import {
  Bot,
  LayoutPanelTop,
  PanelsTopLeft,
  SearchCheck,
  ShieldEllipsis,
} from "lucide-react";

const items = [
  {
    eyebrow: "USP 1",
    title: "Workflow-Centric Prompt Engineering",
    description:
      "Users fill in a structured marketing form instead of writing prompts manually. The backend assembles the input into a stable, high-quality master prompt.",
    icon: Bot,
    bullets: [
      "Input product name, platform, tone and target keyword",
      "Reduce context switching during content production",
    ],
  },
  {
    eyebrow: "USP 2",
    title: "Built-in Realtime SEO Analyzer",
    description:
      "Freshly generated content and manual edits are scored directly inside the editor so SEO issues are caught early.",
    icon: SearchCheck,
    bullets: [
      "Track headings, keyword density and meta length",
      "Use green, yellow and red states for faster decisions",
    ],
  },
  {
    eyebrow: "USP 3",
    title: "Dynamic Banner Preview",
    description:
      "Headlines and CTAs are placed on feed and story mockups inside the app so the marketing team can review instantly.",
    icon: PanelsTopLeft,
    bullets: [
      "Preview ads without opening Canva or Photoshop",
      "Templates for social posts and story formats",
    ],
  },
  {
    eyebrow: "USP 4",
    title: "Enterprise-Ready Architecture",
    description:
      "The system supports User and Admin roles, campaign-based history and data isolation so teams can work safely at scale.",
    icon: ShieldEllipsis,
    bullets: [
      "Role-based access control and admin routes",
      "Track content, campaigns and AI usage costs",
    ],
  },
];

const journey = [
  { label: "Brief intake", value: "Structured form input" },
  { label: "Content generation", value: "AI creates formatted drafts" },
  { label: "Optimization", value: "SEO analyzer updates in real time" },
  { label: "Delivery", value: "Banner preview ready for review" },
];

export function UspSection() {
  return (
    <section className="space-y-10">
      <div className="max-w-3xl space-y-4">
        <span className="inline-flex rounded-full border border-slate-300 bg-white/80 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-500 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-400">
          Four product differentiators
        </span>
        <h2 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
          Built for marketers who need speed without losing execution quality.
        </h2>
        <p className="text-base leading-7 text-slate-600 dark:text-slate-300">
          This landing page highlights the four core USPs from the PRD: prompt
          workflow, SEO analysis, banner preview and team-ready architecture.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {items.map((item, index) => {
          const Icon = item.icon;

          return (
            <article
              key={item.title}
              className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm transition-transform duration-300 hover:-translate-y-1 dark:border-slate-800 dark:bg-slate-900"
              style={{ animationDelay: `${index * 140}ms` }}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-xs uppercase tracking-[0.18em] text-slate-400">
                    {item.eyebrow}
                  </div>
                  <h3 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
                    {item.title}
                  </h3>
                </div>
                <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-brand-primary/10 text-brand-primary">
                  <Icon className="size-5" />
                </div>
              </div>
              <p className="mt-4 text-sm leading-7 text-slate-600 dark:text-slate-300">
                {item.description}
              </p>
              <ul className="mt-5 space-y-2">
                {item.bullets.map((bullet) => (
                  <li
                    key={bullet}
                    className="flex items-start gap-3 text-sm text-slate-700 dark:text-slate-200"
                  >
                    <span className="mt-2 size-1.5 rounded-full bg-brand-secondary" />
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            </article>
          );
        })}
      </div>

      <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-slate-950 p-6 text-white shadow-[0_24px_80px_rgba(15,23,42,0.18)] dark:border-slate-800">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-300">
              <LayoutPanelTop className="size-4" />
              Workflow overview
            </div>
            <h3 className="text-3xl font-semibold tracking-tight">
              From idea to marketing asset, the full flow lives in one workspace.
            </h3>
            <p className="text-sm leading-7 text-slate-300">
              That is the core product value: reduce tool switching, standardize the
              workflow and keep outcomes measurable for marketing teams and agencies.
            </p>
          </div>
          <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200">
            Static landing, no API calls
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-4">
          {journey.map((step) => (
            <div
              key={step.label}
              className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4"
            >
              <div className="text-xs uppercase tracking-[0.18em] text-slate-500">
                {step.label}
              </div>
              <div className="mt-3 text-lg font-semibold text-white">{step.value}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
