import {
  Activity,
  FileText,
  FolderKanban,
  LayoutDashboard,
  Shield,
  Sparkles,
  Users,
} from "lucide-react";
import { Link, NavLink } from "react-router-dom";

import { cn } from "@/lib/utils";

const userLinks = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/campaigns", label: "Campaigns", icon: FolderKanban },
  { to: "/contents", label: "Editor", icon: Sparkles },
];

const adminLinks = [
  { to: "/admin", label: "Admin", icon: Shield, end: true },
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/campaigns", label: "Campaigns", icon: FolderKanban },
  { to: "/admin/contents", label: "Contents", icon: FileText },
  { to: "/admin/ai-usage", label: "AI Usage", icon: Activity },
];

export function Sidebar({ collapsed = false, isAdmin = false }) {
  const links = isAdmin ? [...userLinks, ...adminLinks] : userLinks;

  return (
    <aside
      className={cn(
        "flex min-h-screen flex-col border-r border-slate-200 bg-white/80 px-3 py-5 backdrop-blur dark:border-slate-800 dark:bg-slate-950/70",
        collapsed ? "w-[92px]" : "w-72"
      )}
    >
      <Link
        to="/dashboard"
        className="mb-8 flex items-center gap-3 rounded-2xl px-3 py-2 text-slate-900 dark:text-white"
      >
        <div className="flex size-10 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-primary to-brand-secondary text-sm font-bold text-white">
          AI
        </div>
        {!collapsed ? (
          <div className="text-sm font-semibold">AI Content Studio</div>
        ) : null}
      </Link>

      <nav className="space-y-1">
        {links.map((link) => {
          const Icon = link.icon;

          return (
            <NavLink
              key={`${link.to}-${link.label}`}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-white"
                )
              }
            >
              <Icon className="size-4" />
              {!collapsed ? <span>{link.label}</span> : null}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}
