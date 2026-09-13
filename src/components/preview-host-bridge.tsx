/**
 * Mount once in `__root.tsx` so the Grok preview chrome can drive navigation
 * (and later receive registered routes). Noops when the app is not embedded.
 */

import { useEffect } from "react";
import { useRouter } from "@tanstack/react-router";
import {
  collectRoutePathsFromTree,
  installPreviewHostBridge,
} from "@/lib/preview-host-bridge";

export function PreviewHostBridge() {
  const router = useRouter();

  useEffect(() => {
    const host = window.location.hostname;
    const live =
      host === "www.sadhgurugemsandjewellers.com" || host === "sadhgurugemsandjewellers.com";
    if (!live) {
      const meta = document.createElement("meta");
      meta.setAttribute("name", "robots");
      meta.setAttribute("content", "noindex,nofollow");
      document.head.appendChild(meta);
    }
    return installPreviewHostBridge({
      navigate: (path) => {
        router.history.push(path);
      },
      getRoutePaths: () => collectRoutePathsFromTree(router.routeTree),
    });
  }, [router]);

  return null;
}
