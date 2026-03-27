import { LoaderCircle } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

export function AdminReasonDialog({
  open,
  title,
  description,
  confirmLabel,
  isSubmitting = false,
  errorMessage = "",
  onCancel,
  onConfirm,
}) {
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (open) {
      setReason("");
    }
  }, [open]);

  if (!open) {
    return null;
  }

  const normalizedReason = reason.trim();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-[2rem] border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        <div className="space-y-3">
          <h3 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
            {title}
          </h3>
          <p className="text-sm leading-7 text-slate-600 dark:text-slate-300">
            {description}
          </p>
        </div>

        <div className="mt-5 space-y-2">
          <label
            htmlFor="admin-reason"
            className="text-sm font-medium text-slate-800 dark:text-slate-200"
          >
            Reason
          </label>
          <textarea
            id="admin-reason"
            rows={4}
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            placeholder="Enter the admin reason for this action"
          />
          <p className="text-xs text-slate-500 dark:text-slate-400">
            This reason will be stored in the admin audit trail.
          </p>
        </div>

        {errorMessage ? (
          <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300">
            {errorMessage}
          </div>
        ) : null}

        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            onClick={() => onConfirm(normalizedReason)}
            disabled={isSubmitting || !normalizedReason}
          >
            {isSubmitting ? (
              <>
                <LoaderCircle className="mr-2 size-4 animate-spin" />
                Working...
              </>
            ) : (
              confirmLabel
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
