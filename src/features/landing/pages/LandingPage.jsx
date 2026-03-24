import { ArrowRight, ShieldCheck, Sparkles, SquarePen } from "lucide-react";
import { Link, Navigate } from "react-router-dom";

import { buttonVariants } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

const highlights = [
  {
    title: "Workflow-centric prompt engine",
    description: "Form-based input instead of manual prompt writing.",
    icon: SquarePen,
  },
  {
    title: "Realtime SEO scoring",
    description: "Editor-ready analysis pipeline with structured metadata output.",
    icon: Sparkles,
  },
  {
    title: "Enterprise-ready shell",
    description: "JWT, RBAC, protected routes and admin guardrails are built in.",
    icon: ShieldCheck,
  },
];

export function LandingPage() {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-8">
        <header className="flex items-center justify-between">
          <div className="text-sm font-semibold tracking-[0.24em] text-slate-300">
            AI CONTENT STUDIO
          </div>
          <div className="flex gap-3">
            <Link
              to="/login"
              className={cn(
                buttonVariants({ variant: "ghost", className: "text-white hover:bg-white/10" })
              )}
            >
              Login
            </Link>
            <Link
              to="/register"
              className={cn(
                buttonVariants({ className: "bg-white text-slate-950 hover:bg-slate-100" })
              )}
            >
              Register
            </Link>
          </div>
        </header>

        <div className="grid flex-1 items-center gap-12 py-16 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="space-y-8">
            <div className="space-y-4">
              <span className="inline-flex rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.24em] text-slate-300">
                Phase 0 complete
              </span>
              <h1 className="max-w-3xl text-5xl font-semibold tracking-tight text-white sm:text-6xl">
                Project shell, auth pipeline and protected navigation are ready.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-slate-300">
                This is the bootstrap surface for the AI marketing platform. The
                feature pages are still placeholders, but the app infrastructure is
                wired for campaign, content and admin workflows.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                to="/register"
                className={cn(
                  buttonVariants({
                    className:
                      "bg-gradient-to-r from-brand-primary to-brand-secondary text-white",
                  })
                )}
              >
                Start building
                <ArrowRight className="ml-1 size-4" />
              </Link>
              <Link
                to="/login"
                className={cn(
                  buttonVariants({
                    variant: "outline",
                    className: "border-white/20 bg-white/5 text-white hover:bg-white/10",
                  })
                )}
              >
                Sign in
              </Link>
            </div>
          </section>

          <section className="grid gap-4">
            {highlights.map((item) => {
              const Icon = item.icon;

              return (
                <article
                  key={item.title}
                  className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur"
                >
                  <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-white/10">
                    <Icon className="size-5 text-slate-100" />
                  </div>
                  <h2 className="text-xl font-semibold text-white">{item.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    {item.description}
                  </p>
                </article>
              );
            })}
          </section>
        </div>
      </div>
    </div>
  );
}
