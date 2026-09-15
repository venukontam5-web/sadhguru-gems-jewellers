import { useEffect } from "react";
import { useRouterState } from "@tanstack/react-router";
import { countryFromTimeZone } from "@/lib/shop";
import { logVisit } from "@/server/catalogue";
import { placeFromTimeZone, readGuest, requirementFromPath } from "@/lib/visit";

export function VisitBeacon() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  useEffect(() => {
    if (
      pathname.startsWith("/owner") ||
      pathname.startsWith("/admin") ||
      pathname.startsWith("/login") ||
      pathname.startsWith("/api")
    ) {
      return;
    }
    const key = `sgj-visit:${pathname || "/"}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch {
      /* private mode */
    }
    const fire = () => {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
      const guest = readGuest();
      void logVisit({
        data: {
          path: pathname || "/",
          country: countryFromTimeZone(tz),
          place: placeFromTimeZone(tz),
          requirement: requirementFromPath(pathname || "/"),
          name: guest.name,
          contact: guest.phone,
          email: guest.email,
        },
      });
    };
    if (typeof requestIdleCallback === "function") {
      const id = requestIdleCallback(fire, { timeout: 2500 });
      return () => cancelIdleCallback(id);
    }
    const t = window.setTimeout(fire, 900);
    return () => window.clearTimeout(t);
  }, [pathname]);
  return null;
}
