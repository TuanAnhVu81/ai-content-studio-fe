import { Outlet } from "react-router-dom";

export function AuthLayout() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(79,70,229,0.16),_transparent_30%),linear-gradient(180deg,_#f8fafc_0%,_#eef2ff_100%)] px-4 py-10 dark:bg-[radial-gradient(circle_at_top,_rgba(139,92,246,0.16),_transparent_30%),linear-gradient(180deg,_#020617_0%,_#0f172a_100%)]">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-5xl items-center justify-center">
        <div className="grid w-full overflow-hidden rounded-[32px] border border-white/60 bg-white/80 shadow-2xl backdrop-blur dark:border-slate-800/80 dark:bg-slate-950/80 md:grid-cols-[1.1fr_0.9fr]">
          <div className="hidden border-r border-slate-200/80 bg-slate-900 p-10 text-white dark:border-slate-800 md:block">
            <div className="space-y-6">
              <div className="space-y-3">
                <h1 className="text-4xl font-semibold tracking-tight text-white">
                  Bootstrap the product shell before features land.
                </h1>
                <p className="max-w-md text-sm leading-7 text-slate-300">
                  Auth routes, protected navigation, request pipeline and app state are
                  ready. The feature work in later phases can plug into this shell
                  directly.
                </p>
              </div>
            </div>
          </div>
          <div className="p-6 sm:p-10">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}
