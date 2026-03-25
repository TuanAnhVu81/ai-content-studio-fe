import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function CampaignSlideOver({ open, title, description, onClose, children }) {
  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose, open]);

  if (typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div
      className={cn(
        "fixed inset-0 z-[100] flex justify-end transition-opacity duration-300",
        open ? "pointer-events-auto" : "pointer-events-none"
      )}
      aria-hidden={!open}
    >
      <button
        type="button"
        className={cn(
          "absolute inset-0 bg-slate-950/40 backdrop-blur-sm transition-opacity duration-300",
          open ? "opacity-100" : "opacity-0"
        )}
        onClick={onClose}
        aria-label="Close campaign form"
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn(
          "relative flex h-full w-full max-w-[42rem] translate-x-full flex-col bg-white shadow-2xl transition-transform duration-500 ease-in-out dark:bg-slate-950",
          open && "translate-x-0"
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-6 dark:border-slate-800 sm:px-8">
          <div className="space-y-1">
            <div className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
              Campaign workspace
            </div>
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
              {title}
            </h2>
            {description ? (
              <p className="max-w-xl text-sm leading-7 text-slate-600 dark:text-slate-300">
                {description}
              </p>
            ) : null}
          </div>

          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            className="shrink-0"
            onClick={onClose}
            aria-label="Close campaign form"
          >
            <X className="size-4" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-8 sm:px-8">{children}</div>
      </aside>
    </div>,
    document.body
  );
}
