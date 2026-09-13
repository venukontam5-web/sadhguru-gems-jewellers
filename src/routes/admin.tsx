import { createFileRoute } from "@tanstack/react-router";
import { AdminLoginScreen } from "@/components/admin-login-screen";
import { SITE } from "@/data/site";

export const Route = createFileRoute("/admin")({
  component: AdminLoginScreen,
  head: () => ({
    meta: [
      { title: `Admin · ${SITE.name}` },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
});