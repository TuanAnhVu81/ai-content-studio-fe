import { ChangePasswordForm } from "@/features/auth/components/ChangePasswordForm";

export function ChangePasswordPage() {
  return (
    <section className="mx-auto max-w-2xl rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
      <div className="space-y-3">
        <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-slate-500 dark:bg-slate-800 dark:text-slate-300">
          Account security
        </span>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">
          Change password
        </h1>
        <p className="text-sm leading-7 text-slate-600 dark:text-slate-300">
          Update your password to keep your workspace secure and maintain access to
          protected user and admin tools.
        </p>
      </div>

      <div className="mt-8">
        <ChangePasswordForm />
      </div>
    </section>
  );
}
