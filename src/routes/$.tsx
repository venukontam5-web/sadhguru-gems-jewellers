import { createFileRoute } from "@tanstack/react-router";
import { AppNotFoundComponent } from "@/lib/error-component";

export const Route = createFileRoute("/$")({
  component: AppNotFoundComponent,
});