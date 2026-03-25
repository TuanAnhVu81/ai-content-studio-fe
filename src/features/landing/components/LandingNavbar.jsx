import { Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function LandingNavbar() {
  return (
    <header className="sticky top-0 z-20">
      <div className="mx-auto flex max-w-7xl items-center justify-between rounded-full border border-slate-200/70 bg-white/85 px-4 py-3 shadow-[0_10px_40px_rgba(15,23,42,0.08)] backdrop-blur dark:border-slate-800/80 dark:bg-slate-950/75 sm:px-6">
        <Link to="/" className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-primary to-brand-secondary text-white shadow-lg shadow-brand-primary/20">
            <Sparkles className="size-5" />
          </div>
          <div>
            <div className="text-sm font-semibold tracking-[0.18em] text-slate-900 dark:text-white">
              AI CONTENT STUDIO
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Marketing AI workspace
            </div>
          </div>
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            to="/login"
            className={cn(
              buttonVariants({
                variant: "ghost",
                className:
                  "text-slate-700 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-200 dark:hover:bg-slate-900",
              })
            )}
          >
            Sign in
          </Link>
          <Link
            to="/register"
            className={cn(
              buttonVariants({
                className:
                  "bg-slate-950 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200",
              })
            )}
          >
            Start for free
          </Link>
        </div>
      </div>
    </header>
  );
}
