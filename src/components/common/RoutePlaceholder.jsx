import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function RoutePlaceholder({
  eyebrow,
  title,
  description,
  primaryAction,
  secondaryAction,
  children,
}) {
  return (
    <section className="space-y-6 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="space-y-3">
        {eyebrow ? (
          <span className="inline-flex rounded-full bg-brand-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-brand-primary">
            {eyebrow}
          </span>
        ) : null}
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">
            {title}
          </h1>
          <p className="max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-300">
            {description}
          </p>
        </div>
      </div>

      {(primaryAction || secondaryAction) && (
        <div className="flex flex-wrap gap-3">
          {primaryAction ? (
            <Link
              to={primaryAction.to}
              className={cn(
                buttonVariants({ className: "bg-slate-900 text-white hover:bg-slate-800" })
              )}
            >
              {primaryAction.label}
              <ArrowRight className="ml-1 size-4" />
            </Link>
          ) : null}
          {secondaryAction ? (
            <Link
              to={secondaryAction.to}
              className={buttonVariants({ variant: "outline" })}
            >
              {secondaryAction.label}
            </Link>
          ) : null}
        </div>
      )}

      {children}
    </section>
  );
}
