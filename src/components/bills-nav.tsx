import type { ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

const TABS = [
  { to: "/owner/bills", label: "Overview", exact: true },
  { to: "/owner/bills/sale", label: "Sales bill" },
  { to: "/owner/bills/stock", label: "Stock entry" },
  { to: "/owner/bills/purchase", label: "Purchase bill" },
  { to: "/owner/bills/repair", label: "Repair & polished" },
  { to: "/owner/bills/returns", label: "Return & cancellation" },
  { to: "/owner/bills/expenses", label: "Daily expenses" },
] as const;

export function BillsNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav className="print-hidden mt-6 flex gap-2 overflow-x-auto pb-1">
      {TABS.map((t) => {
        const on = "exact" in t && t.exact ? pathname === t.to || pathname === `${t.to}/` : pathname.startsWith(t.to);
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

export function BillsHeading({
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
