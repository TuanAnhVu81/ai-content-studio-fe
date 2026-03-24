import { Outlet } from "react-router-dom";

import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { useAuth } from "@/hooks/useAuth";
import { useUiStore } from "@/store/uiStore";

export function MainLayout() {
  const { isAdmin } = useAuth();
  const isSidebarCollapsed = useUiStore((state) => state.isSidebarCollapsed);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="flex min-h-screen">
        <Sidebar collapsed={isSidebarCollapsed} isAdmin={isAdmin} />
        <div className="flex min-h-screen flex-1 flex-col">
          <Topbar />
          <main className="flex-1 p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
