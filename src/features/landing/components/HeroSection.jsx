import {
  ArrowRight,
  BadgeCheck,
  Bot,
  Gauge,
  LayoutTemplate,
  Play,
} from "lucide-react";
import { Link } from "react-router-dom";

import heroImage from "@/assets/hero.png";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const quickStats = [
  { label: "Time-to-draft", value: "< 1 minute" },
  { label: "SEO feedback", value: "Real time" },
  { label: "Workflow", value: "All-in-one" },
];

const workflow = [
  "Input brief",
  "Generate content",
  "Score SEO",
  "Preview banner",
];

export function HeroSection() {
  return (
    <section className="grid gap-14 lg:grid-cols-[minmax(0,1.05fr)_minmax(420px,0.95fr)] lg:items-center">
      <div className="space-y-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-brand-primary/15 bg-brand-primary/10 px-4 py-1.5 text-sm font-medium text-brand-primary animate-fade-up">
          <BadgeCheck className="size-4" />
          Automate marketing content with AI + SEO + Preview
        </div>

        <div className="space-y-5">
          <h1 className="max-w-4xl text-5xl font-semibold tracking-tight text-slate-900 dark:text-white sm:text-6xl xl:text-7xl">
            Turn scattered briefs into one connected content production workflow.
          </h1>
          <p className="max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-300">
            AI Content Studio helps copywriters and marketers stop jumping between
            ChatGPT, SEO tools and Canva. One workspace to create, optimize,
            preview and organize content by campaign.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            to="/register"
            className={cn(
              buttonVariants({
                size: "lg",
                className:
                  "bg-gradient-to-r from-brand-primary to-brand-secondary px-5 text-white shadow-lg shadow-brand-primary/20 hover:opacity-95",
              })
            )}
          >
            Start today
            <ArrowRight className="ml-1 size-4" />
          </Link>
          <Link
            to="/login"
            className={cn(
              buttonVariants({
                variant: "outline",
                size: "lg",
                className:
                  "border-slate-300 bg-white/80 px-5 text-slate-900 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900/60 dark:text-white dark:hover:bg-slate-800",
              })
            )}
          >
            <Play className="mr-1 size-4" />
            Sign in
          </Link>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          {quickStats.map((stat, index) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-slate-200 bg-white/75 p-4 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/65"
              style={{ animationDelay: `${index * 120}ms` }}
            >
              <div className="text-xs uppercase tracking-[0.18em] text-slate-400">
                {stat.label}
              </div>
              <div className="mt-2 text-xl font-semibold text-slate-900 dark:text-white">
                {stat.value}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="relative">
        <div className="absolute inset-x-8 top-8 h-40 rounded-full bg-brand-primary/20 blur-3xl animate-pulse-soft" />
        <div className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-4 shadow-[0_30px_120px_rgba(79,70,229,0.18)] dark:border-slate-800 dark:bg-slate-950">
          <div className="rounded-[1.6rem] bg-slate-950 p-5 text-white">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-xs uppercase tracking-[0.18em] text-slate-400">
                  Product mockup
                </div>
                <div className="mt-2 text-2xl font-semibold">
                  AI content workspace
                </div>
              </div>
              <div className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">
                SEO score live
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-[1fr_200px]">
              <div className="overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/5">
                <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 text-sm text-slate-300">
                  <span>Draft editor</span>
                  <span className="rounded-full bg-white/10 px-2 py-1 text-xs">
                    Gemini ready
                  </span>
                </div>
                <div className="relative min-h-[280px] bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 p-4">
                  <img
                    src={heroImage}
                    alt="AI Content Studio workspace preview"
                    className="absolute inset-0 h-full w-full object-cover opacity-35"
                  />
                  <div className="relative space-y-4">
                    <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
                      <div className="flex items-center gap-2 text-brand-secondary">
                        <Bot className="size-4" />
                        <span className="text-sm font-medium">Master Prompt</span>
                      </div>
                      <p className="mt-3 text-sm leading-6 text-slate-200">
                        Create a Facebook post for a new product launch campaign,
                        use a persuasive tone and focus on the keyword "AI marketing".
                      </p>
                    </div>
                    <div className="rounded-2xl border border-brand-primary/15 bg-brand-primary/10 p-4 text-sm text-slate-100">
                      Headline, CTA and body copy are generated in one pass and can
                      move directly into the editor.
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center gap-2 text-sm text-slate-300">
                    <Gauge className="size-4 text-emerald-300" />
                    SEO Analyzer
                  </div>
                  <div className="mt-3 text-4xl font-semibold text-white">87/100</div>
                  <div className="mt-3 h-2 rounded-full bg-white/10">
                    <div className="h-2 w-[87%] rounded-full bg-gradient-to-r from-emerald-400 to-lime-300" />
                  </div>
                  <ul className="mt-4 space-y-2 text-sm text-slate-300">
                    <li>Keyword density is within range</li>
                    <li>Meta title is valid</li>
                    <li>Add one more H2 heading</li>
                  </ul>
                </div>

                <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4 animate-float">
                  <div className="flex items-center gap-2 text-sm text-slate-300">
                    <LayoutTemplate className="size-4 text-brand-secondary" />
                    Banner Preview
                  </div>
                  <div className="mt-4 aspect-[9/12] rounded-[1.25rem] bg-gradient-to-br from-brand-primary via-brand-secondary to-slate-950 p-4">
                    <div className="flex h-full flex-col justify-between rounded-[1rem] border border-white/20 bg-black/15 p-4">
                      <span className="text-xs uppercase tracking-[0.2em] text-white/70">
                        Story format
                      </span>
                      <div>
                        <div className="max-w-[8ch] text-2xl font-semibold leading-tight text-white">
                          AI writes faster and with better structure.
                        </div>
                        <div className="mt-3 inline-flex rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-950">
                          Try the studio
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 grid gap-3 rounded-[1.5rem] border border-white/10 bg-white/5 p-4 sm:grid-cols-4">
              {workflow.map((step, index) => (
                <div
                  key={step}
                  className="rounded-2xl border border-white/10 bg-black/20 px-3 py-3 text-sm text-slate-200"
                >
                  <div className="text-xs uppercase tracking-[0.18em] text-slate-500">
                    Step {index + 1}
                  </div>
                  <div className="mt-2 font-medium text-white">{step}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
