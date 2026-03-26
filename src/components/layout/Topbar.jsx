import { LoaderCircle, LogOut, Moon, PanelLeftClose, PanelLeftOpen, Sun } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { authService } from "@/services/authService";
import { useUiStore } from "@/store/uiStore";
import { getApiErrorMessage } from "@/utils/getApiErrorMessage";

export function Topbar() {
  const navigate = useNavigate();
  const { user, clearAuth } = useAuth();
  const isSidebarCollapsed = useUiStore((state) => state.isSidebarCollapsed);
  const toggleSidebar = useUiStore((state) => state.toggleSidebar);
  const theme = useUiStore((state) => state.theme);
  const toggleTheme = useUiStore((state) => state.toggleTheme);
  const [logoutError, setLogoutError] = useState("");
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLogoutError("");
    setIsLoggingOut(true);

    try {
      await authService.logout();
      clearAuth();
      navigate("/login", { replace: true });
    } catch (error) {
      setLogoutError(getApiErrorMessage(error, "Logout failed. Please try again."));
    } finally {
      setIsLoggingOut(false);
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
      </div>

      <div className="flex items-center gap-3">
        {logoutError ? (
          <p className="hidden max-w-xs text-right text-xs text-red-600 dark:text-red-400 lg:block">
            {logoutError}
          </p>
        ) : null}
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
        <Link
          to="/change-password"
          className="hidden rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-slate-950 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-900 dark:hover:text-white sm:inline-flex"
        >
          Password
        </Link>
        <Button variant="outline" onClick={handleLogout} disabled={isLoggingOut}>
          {isLoggingOut ? (
            <LoaderCircle className="mr-2 size-4 animate-spin" />
          ) : (
            <LogOut className="mr-2 size-4" />
          )}
          {isLoggingOut ? "Logging out..." : "Logout"}
        </Button>
      </div>
    </header>
  );
}
