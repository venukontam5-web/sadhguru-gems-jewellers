import type { ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { statusLabel, type StockStatus } from "@/lib/inventory";

const TABS = [
  { to: "/owner/inventory", label: "Overview", exact: true },
  { to: "/owner/inventory/stock", label: "Stock book" },
  { to: "/owner/inventory/scan", label: "Barcode" },
  { to: "/owner/print", label: "Scan print" },
  { to: "/owner/inventory/labels", label: "Labels" },
  { to: "/owner/inventory/ledger", label: "In & out" },
  { to: "/owner/inventory/alerts", label: "Low stock" },
] as const;

export function InventoryNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav className="print-hidden mt-6 flex gap-2 overflow-x-auto pb-1">
      {TABS.map((t) => {
        const on =
          "exact" in t && t.exact
            ? pathname === t.to || pathname === `${t.to}/`
            : pathname.startsWith(t.to);
        return (
          <Link
            key={t.to}
            to={t.to}
            className={cn(
              "inline-flex h-11 shrink-0 items-center rounded-xl px-4 text-sm",
              on ? "bg-white/12 text-parchment" : "text-parchment/65 hover:bg-white/6",
            )}
          >
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function InventoryHeading({
  kicker,
  title,
  note,
  action,
}: {
  kicker: string;
  title: string;
  note: string;
  action?: ReactNode;
}) {
  return (
    <div className="print-hidden flex flex-wrap items-end justify-between gap-3">
      <div>
        <p className="text-[10px] tracking-[0.2em] text-bronze uppercase">{kicker}</p>
        <h1 className="font-display text-4xl font-semibold">{title}</h1>
        <p className="mt-1 max-w-xl text-sm text-parchment/60">{note}</p>
      </div>
      {action}
    </div>
  );
}

export function StockPill({ status }: { status: StockStatus }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2 py-0.5 text-[11px] tracking-wide uppercase",
        status === "out"
          ? "bg-red-400/15 text-red-200"
          : status === "low"
            ? "bg-bronze/20 text-bronze"
            : "bg-white/8 text-parchment/70",
      )}
    >
      {statusLabel(status)}
    </span>
  );
}
