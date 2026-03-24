import { useEffect } from "react";

import { AppSpinner } from "@/components/common/AppSpinner";
import { useInitAuth } from "@/hooks/useInitAuth";
import { AppRouter } from "@/routes/AppRouter";
import { useUiStore } from "@/store/uiStore";

export default function App() {
  const theme = useUiStore((state) => state.theme);
  const { isInitializing } = useInitAuth();

  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("theme");
    root.classList.toggle("dark", theme === "dark");
  }, [theme]);

  if (isInitializing) {
    return <AppSpinner fullScreen label="Restoring your session..." />;
  }

  return <AppRouter />;
}
