import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function FinalCtaSection() {
  return (
    <section className="rounded-[2.5rem] border border-slate-200 bg-gradient-to-br from-slate-950 via-slate-900 to-brand-primary p-8 text-white shadow-[0_30px_120px_rgba(79,70,229,0.18)] dark:border-slate-800 sm:p-10">
      <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
        <div className="max-w-2xl space-y-4">
          <div className="inline-flex rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-200">
            CTA
          </div>
          <h2 className="text-4xl font-semibold tracking-tight">
            Start today and give your content team one workspace to operate from.
          </h2>
          <p className="text-base leading-7 text-slate-200">
            The landing page is now ready to route guests to login and registration.
            The next phases only need to attach real auth and data flows to this shell.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            to="/register"
            className={cn(
              buttonVariants({
                size: "lg",
                className: "bg-white px-5 text-slate-950 hover:bg-slate-100",
              })
            )}
          >
            Start for free
            <ArrowRight className="ml-1 size-4" />
          </Link>
          <Link
            to="/login"
            className={cn(
              buttonVariants({
                size: "lg",
                variant: "outline",
                className:
                  "border-white/20 bg-white/5 px-5 text-white hover:bg-white/10",
              })
            )}
          >
            Sign in
          </Link>
        </div>
      </div>
    </section>
  );
}
