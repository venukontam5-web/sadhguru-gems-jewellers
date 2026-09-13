import { cn } from "@/lib/utils";

export type DeskTab<T extends string = string> = {
  id: T;
  label: string;
  count?: number;
};

export function DeskTabs<T extends string>({
  tabs,
  value,
  onChange,
  label = "Sections",
}: {
  tabs: readonly DeskTab<T>[];
  value: T;
  onChange: (id: T) => void;
  label?: string;
}) {
  return (
    <nav className="mt-6 flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label={label}>
      {tabs.map((t) => {
        const on = t.id === value;
        return (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={on}
            onClick={() => onChange(t.id)}
            className={cn(
              "inline-flex h-11 shrink-0 items-center gap-2 rounded-xl px-4 text-sm transition-colors",
              on ? "bg-ink text-ivory" : "text-ink-muted hover:bg-ink/5",
            )}
          >
            {t.label}
            {t.count != null ? (
              <span className="rounded-full bg-ivory/20 px-1.5 py-0.5 text-[11px] tabular-nums">
                {t.count}
              </span>
            ) : null}
          </button>
        );
      })}
    </nav>
  );
}
