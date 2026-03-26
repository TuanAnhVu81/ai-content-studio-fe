import { CalendarDays, ExternalLink, FolderKanban, FileText } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Link } from "react-router-dom";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const contentStatusClasses = {
  DRAFT:
    "border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200",
  PUBLISHED:
    "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300",
  ARCHIVED:
    "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300",
};

function formatRelativeDate(value) {
  if (!value) {
    return "Unknown";
  }

  try {
    return formatDistanceToNow(new Date(value), { addSuffix: true });
  } catch {
    return "Unknown";
  }
}

function ContentStatusBadge({ status }) {
  const label = status ?? "DRAFT";

  return (
    <span
      className={cn(
        "inline-flex rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em]",
        contentStatusClasses[label] ?? contentStatusClasses.DRAFT
      )}
    >
      {label}
    </span>
  );
}

export function RecentActivityList({ contents }) {
  return (
    <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-col gap-4 border-b border-slate-200 px-6 py-5 dark:border-slate-800 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-slate-500 dark:bg-slate-800 dark:text-slate-300">
            Recent activity
          </span>
          <h2 className="mt-4 text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
            Review the latest five content records before jumping back into the editor.
          </h2>
        </div>

        <Link
          to="/contents"
          className={cn(buttonVariants({ variant: "outline" }))}
        >
          View all
        </Link>
      </div>

      <div className="p-6">
        {contents.length === 0 ? (
          <div className="rounded-[1.75rem] border border-dashed border-slate-300 bg-slate-50 px-6 py-8 text-center dark:border-slate-700 dark:bg-slate-950/50">
            <div className="mx-auto max-w-md space-y-3">
              <h3 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-white">
                No recent content yet.
              </h3>
              <p className="text-sm leading-7 text-slate-600 dark:text-slate-300">
                Once content generation is in use, the five most recent records will appear
                here with campaign context and editor shortcuts.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {contents.map((content) => {
              const campaignLabel =
                content.campaign_name ||
                (content.campaign_id
                  ? `Campaign ${String(content.campaign_id).slice(0, 8)}`
                  : "Campaign details unavailable");

              return (
                <article
                  key={content.id}
                  className="rounded-[1.75rem] border border-slate-200 bg-slate-50 px-5 py-5 transition-colors hover:border-slate-300 hover:bg-white dark:border-slate-800 dark:bg-slate-950/60 dark:hover:border-slate-700 dark:hover:bg-slate-950"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-3">
                      <ContentStatusBadge status={content.status} />
                      <div className="space-y-2">
                        <h3 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-white">
                          {content.target_keyword}
                        </h3>
                        <div className="flex flex-col gap-2 text-sm text-slate-600 dark:text-slate-300">
                          <span className="inline-flex items-center gap-2">
                            <FolderKanban className="size-4 text-brand-primary" />
                            {campaignLabel}
                          </span>
                          <span className="inline-flex items-center gap-2">
                            <CalendarDays className="size-4 text-sky-500" />
                            Created {formatRelativeDate(content.created_at)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <Link
                      to={`/editor/${content.id}`}
                      className={cn(
                        buttonVariants({
                          variant: "outline",
                          className:
                            "shrink-0 border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-950/60",
                        })
                      )}
                    >
                      <FileText className="mr-2 size-4" />
                      Open editor
                      <ExternalLink className="ml-2 size-4" />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
