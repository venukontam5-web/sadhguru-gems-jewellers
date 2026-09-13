import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { AlertTriangle, ArrowDownUp, Barcode, BookOpen } from "lucide-react";
import { ownerInventorySummary } from "@/server/stock";
import {
  money,
  signedQty,
  STOCK_KIND_LABEL,
  type InventorySummary,
  type StockKind,
} from "@/lib/inventory";
import { InventoryHeading, InventoryNav, StockPill } from "@/components/inventory-nav";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/owner/inventory/")({
  component: InventoryHub,
});

function InventoryHub() {
  const [data, setData] = useState<InventorySummary | null>(null);
  const load = useCallback(() => {
    void ownerInventorySummary().then(setData);
  }, []);
  useEffect(load, [load]);

  if (!data) return <p className="text-sm text-parchment/60">Opening the stock book…</p>;

  const tools = [
    {
      to: "/owner/inventory/stock" as const,
      icon: BookOpen,
      title: "Stock book",
      body: "Every piece, tray and shelf — count, location, value.",
      extra: `${data.skus} SKUs · ${data.pieces} pieces`,
    },
    {
      to: "/owner/inventory/scan" as const,
      icon: Barcode,
      title: "Barcode scanner",
      body: "USB gun, camera, or type the SKU. Print Code 128 labels.",
      extra: "Check a scanner at the counter",
    },
    {
      to: "/owner/inventory/ledger" as const,
      icon: ArrowDownUp,
      title: "In & out",
      body: "Purchase in, sale out, returns and cabinet counts.",
      extra: "Ledger of every movement",
    },
    {
      to: "/owner/inventory/alerts" as const,
      icon: AlertTriangle,
      title: "Low stock",
      body: "Pieces at or below the reorder line, and those that have gone.",
      extra: `${data.lowCount} low · ${data.outCount} out`,
    },
  ];

  return (
    <div>
      <InventoryHeading
        kicker="Inventory"
        title="Inventory tools"
        note="The cabinet, the Navratna tray, brass and malas. Sales and purchases from the bills desk move the count."
        action={
          <Link
            to="/owner/inventory/stock"
            className={cn(buttonVariants({ size: "sm" }), "bg-bronze text-ink hover:bg-bronze-soft")}
          >
            Open stock book
          </Link>
        }
      />
      <InventoryNav />

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          [String(data.skus), "SKUs in the house"],
          [String(data.pieces), "pieces on hand"],
          [money(data.retailValue), "retail value"],
          [String(data.lowCount + data.outCount), "need a watch"],
        ].map(([n, l]) => (
          <div key={String(l)} className="rounded-2xl border border-white/8 bg-white/4 p-5">
            <p className="font-display text-3xl">{n}</p>
            <p className="mt-1 text-sm text-parchment/60">{l}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        {tools.map((t) => (
          <Link
            key={t.to}
            to={t.to}
            className="rounded-2xl border border-white/8 bg-white/4 p-5 transition-colors hover:border-bronze/40 hover:bg-white/6"
          >
            <t.icon className="size-5 text-bronze" />
            <h2 className="mt-3 font-display text-2xl">{t.title}</h2>
            <p className="mt-1 text-sm text-parchment/55">{t.body}</p>
            <p className="mt-4 text-xs text-bronze">{t.extra}</p>
          </Link>
        ))}
      </div>

      <h2 className="mt-10 font-display text-2xl">By tray</h2>
      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {data.byCategory.map((c) => (
          <Link
            key={c.category}
            to="/owner/inventory/stock"
            className="rounded-2xl border border-white/8 bg-white/4 p-4 hover:border-bronze/40"
          >
            <p className="text-sm text-parchment/55">{c.category}</p>
            <p className="mt-1 font-display text-2xl">{c.pieces} pcs</p>
            <p className="mt-1 text-sm text-parchment/70">{money(c.retailValue)}</p>
            {c.lowCount ? <p className="mt-2 text-xs text-bronze">{c.lowCount} on watch</p> : null}
          </Link>
        ))}
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-2xl">Low stock</h2>
            <Link to="/owner/inventory/alerts" className="text-sm text-bronze">
              All
            </Link>
          </div>
          {data.low.length ? (
            <ul className="divide-y divide-white/8 rounded-2xl border border-white/8">
              {data.low.map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-3 px-4 py-3">
                  <span>
                    <span className="block text-sm">{p.name}</span>
                    <span className="text-[11px] text-parchment/45">
                      {p.location} · {p.sku}
                    </span>
                  </span>
                  <span className="text-right">
                    <span className="block text-sm">{p.stock}</span>
                    <StockPill status={p.status} />
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="rounded-2xl border border-dashed border-white/12 px-4 py-8 text-center text-sm text-parchment/55">
              Every tray is above its reorder line.
            </p>
          )}
        </div>
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-2xl">Recent in & out</h2>
            <Link to="/owner/inventory/ledger" className="text-sm text-bronze">
              Ledger
            </Link>
          </div>
          {data.recent.length ? (
            <ul className="divide-y divide-white/8 rounded-2xl border border-white/8">
              {data.recent.map((m) => (
                <li key={m.id} className="flex items-center justify-between gap-3 px-4 py-3">
                  <span>
                    <span className="block text-sm">{m.productName}</span>
                    <span className="text-[11px] text-parchment/45">
                      {STOCK_KIND_LABEL[m.kind as StockKind] ?? m.kind}
                      {m.billNumber ? ` · ${m.billNumber}` : ""}
                    </span>
                  </span>
                  <span className={m.qty < 0 ? "text-red-200" : "text-bronze"}>{signedQty(m.qty)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="rounded-2xl border border-dashed border-white/12 px-4 py-8 text-center text-sm text-parchment/55">
              No movements yet.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
