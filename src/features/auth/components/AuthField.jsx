export function AuthField({
  id,
  label,
  type = "text",
  placeholder,
  registration,
  error,
  autoComplete,
  helperText,
}) {
  return (
    <label htmlFor={id} className="block space-y-2">
      <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
        {label}
      </span>
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        {...registration}
        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:border-brand-secondary dark:focus:ring-brand-secondary/10"
      />
      {helperText ? (
        <p className="text-xs text-slate-500 dark:text-slate-400">{helperText}</p>
      ) : null}
      {error ? <p className="text-sm text-red-600 dark:text-red-400">{error}</p> : null}
    </label>
  );
}
