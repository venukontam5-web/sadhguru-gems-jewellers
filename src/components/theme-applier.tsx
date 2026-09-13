import { useEffect } from "react";
import { useRouterState } from "@tanstack/react-router";
import { applyTheme, clearTheme, type SiteTheme } from "@/lib/theme";

export function ThemeApplier({ theme }: { theme: SiteTheme }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const admin = pathname.startsWith("/owner") || pathname === "/admin";

  useEffect(() => {
    if (admin) {
      clearTheme();
      return;
    }
    applyTheme(theme);
  }, [theme, admin]);

  return null;
}
