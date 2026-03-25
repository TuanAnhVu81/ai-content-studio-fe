import { Navigate } from "react-router-dom";

import { FinalCtaSection } from "@/features/landing/components/FinalCtaSection";
import { HeroSection } from "@/features/landing/components/HeroSection";
import { LandingFooter } from "@/features/landing/components/LandingFooter";
import { LandingNavbar } from "@/features/landing/components/LandingNavbar";
import { UspSection } from "@/features/landing/components/UspSection";
import { useAuth } from "@/hooks/useAuth";

export function LandingPage() {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen overflow-hidden bg-[linear-gradient(180deg,_#f8fafc_0%,_#eef2ff_45%,_#ffffff_100%)] text-slate-900 dark:bg-[linear-gradient(180deg,_#020617_0%,_#0f172a_42%,_#111827_100%)] dark:text-white">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-0 h-[520px] bg-[radial-gradient(circle_at_top_left,_rgba(79,70,229,0.18),_transparent_40%),radial-gradient(circle_at_top_right,_rgba(139,92,246,0.16),_transparent_32%)]" />
      <div className="pointer-events-none absolute inset-0 -z-0 bg-[linear-gradient(rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.08)_1px,transparent_1px)] bg-[size:72px_72px] [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col px-4 py-5 sm:px-6 lg:px-8">
        <LandingNavbar />

        <main className="flex-1 space-y-24 pb-12 pt-10 sm:pt-14 lg:space-y-28">
          <HeroSection />
          <UspSection />
          <FinalCtaSection />
        </main>

        <LandingFooter />
      </div>
    </div>
  );
}
