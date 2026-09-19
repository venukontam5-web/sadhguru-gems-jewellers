import type { ErrorComponentProps } from "@tanstack/react-router";
import { SITE } from "@/data/site";

const FALLBACK_MESSAGE = "The tray slipped. Try the shop floor again.";

function errorMessage(error: unknown): string {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === "string" && error) return error;
  return FALLBACK_MESSAGE;
}

export function EmptyTray({
  kicker = "404",
  title = "This tray is empty.",
  note = "The page is not in the cabinet. Start from the shop floor.",
}: {
  kicker?: string;
  title?: string;
  note?: string;
}) {
  return (
    <main className="grid min-h-screen place-items-center bg-ivory px-6 text-center text-ink">
      <div className="max-w-md">
        <p className="text-xs tracking-[0.2em] text-garnet uppercase">{kicker}</p>
        <h1 className="mt-3 font-display text-4xl font-semibold">{title}</h1>
        <p className="mt-4 text-sm text-ink-muted">{note}</p>
        <a
          href="/"
          className="mt-8 inline-flex min-h-11 items-center rounded-full bg-garnet px-5 text-sm text-ivory"
        >
          Back to the shop floor
        </a>
      </div>
    </main>
  );
}

export function AppNotFoundComponent() {
  return (
    <EmptyTray
      note={`Not in the cabinet. The official shop is ${SITE.domain}.`}
    />
  );
}

export function AppErrorComponent({ error }: ErrorComponentProps) {
  return (
    <EmptyTray
      kicker="Hold"
      title="The tray slipped."
      note={errorMessage(error)}
    />
  );
}
