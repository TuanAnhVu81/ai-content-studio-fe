import { LogOut, Moon, PanelLeftClose, PanelLeftOpen, Sun } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { authService } from "@/services/authService";
import { useUiStore } from "@/store/uiStore";

export function Topbar() {
  const navigate = useNavigate();
  const { user, clearAuth } = useAuth();
  const isSidebarCollapsed = useUiStore((state) => state.isSidebarCollapsed);
  const toggleSidebar = useUiStore((state) => state.toggleSidebar);
  const theme = useUiStore((state) => state.theme);
  const toggleTheme = useUiStore((state) => state.toggleTheme);

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      // Keep local logout even if backend is unreachable.
    } finally {
      clearAuth();
      navigate("/login", { replace: true });
    }
  };

  return (
    <header className="flex items-center justify-between gap-4 border-b border-slate-200 bg-white/80 px-6 py-4 backdrop-blur dark:border-slate-800 dark:bg-slate-950/70">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="icon-sm" onClick={toggleSidebar}>
          {isSidebarCollapsed ? (
            <PanelLeftOpen className="size-4" />
          ) : (
            <PanelLeftClose className="size-4" />
          )}
        </Button>
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
            Infrastructure
          </p>
          <p className="text-sm font-semibold text-slate-900 dark:text-white">
            React shell wired for Phase 1+
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button variant="outline" size="icon-sm" onClick={toggleTheme}>
          {theme === "light" ? <Moon className="size-4" /> : <Sun className="size-4" />}
        </Button>
        <div className="hidden text-right sm:block">
          <p className="text-sm font-medium text-slate-900 dark:text-white">
            {user?.full_name ?? user?.email ?? "Guest session"}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {(user?.roles ?? ["ROLE_USER"]).join(", ")}
          </p>
        </div>
        <Button variant="outline" onClick={handleLogout}>
          <LogOut className="mr-2 size-4" />
          Logout
        </Button>
      </div>
    </header>
  );
}
