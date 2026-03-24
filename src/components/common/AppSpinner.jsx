import { LoaderCircle } from "lucide-react";

import { cn } from "@/lib/utils";

export function AppSpinner({ className, fullScreen = false, label = "Loading..." }) {
  return (
    <div
      className={cn(
        "flex items-center justify-center gap-3 text-sm text-slate-600 dark:text-slate-300",
        fullScreen && "min-h-screen bg-slate-50 dark:bg-slate-950",
        className
      )}
    >
      <LoaderCircle className="size-5 animate-spin text-brand-primary" />
      <span>{label}</span>
    </div>
  );
}
