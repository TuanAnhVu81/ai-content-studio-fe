import { Link } from "react-router-dom";

export function LandingFooter() {
  return (
    <footer className="border-t border-slate-200/80 py-8 dark:border-slate-800">
      <div className="flex flex-col gap-4 text-sm text-slate-500 dark:text-slate-400 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="font-medium text-slate-700 dark:text-slate-200">
            AI Content Studio
          </div>
          <div>An AI-powered content marketing platform for teams and agencies.</div>
        </div>
        <div className="flex gap-5">
          <Link
            className="transition-colors hover:text-slate-950 dark:hover:text-white"
            to="/login"
          >
            Login
          </Link>
          <Link
            className="transition-colors hover:text-slate-950 dark:hover:text-white"
            to="/register"
          >
            Register
          </Link>
        </div>
      </div>
    </footer>
  );
}
