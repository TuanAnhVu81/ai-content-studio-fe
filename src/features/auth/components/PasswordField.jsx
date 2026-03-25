import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

export function PasswordField({
  id,
  label,
  placeholder,
  registration,
  error,
  autoComplete,
  helperText,
}) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <label htmlFor={id} className="block space-y-2">
      <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
        {label}
      </span>
      <div className="relative">
        <input
          id={id}
          type={isVisible ? "text" : "password"}
          placeholder={placeholder}
          autoComplete={autoComplete}
          {...registration}
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 pr-12 text-sm text-slate-900 shadow-sm outline-none transition focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:border-brand-secondary dark:focus:ring-brand-secondary/10"
        />
        <button
          type="button"
          onClick={() => setIsVisible((value) => !value)}
          className="absolute inset-y-0 right-0 flex items-center px-4 text-slate-400 transition hover:text-slate-700 dark:hover:text-slate-200"
          aria-label={isVisible ? "Hide password" : "Show password"}
        >
          {isVisible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      </div>
      {helperText ? (
        <p className="text-xs text-slate-500 dark:text-slate-400">{helperText}</p>
      ) : null}
      {error ? <p className="text-sm text-red-600 dark:text-red-400">{error}</p> : null}
    </label>
  );
}
