import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { ownerListStock } from "@/server/stock";
import { money, type StockRow } from "@/lib/inventory";
import { InventoryHeading, InventoryNav, StockPill } from "@/components/inventory-nav";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/owner/inventory/alerts")({
  component: LowStock,
});

function LowStock() {
  const [rows, setRows] = useState<StockRow[]>([]);
  const load = useCallback(() => {
    void ownerListStock().then(setRows);
  }, []);
  useEffect(load, [load]);
  const watch = rows.filter((r) => r.status !== "ok");
  const out = watch.filter((r) => r.status === "out");
  const low = watch.filter((r) => r.status === "low");

  return (
    <div>
      <InventoryHeading
        kicker="Inventory"
        title="Low stock"
        note="Pieces at or below the reorder line, and those that have left the cabinet."
        action={
          <Link
            to="/owner/bills/purchase"
            className={cn(buttonVariants({ size: "sm" }), "bg-bronze text-ink hover:bg-bronze-soft")}
          >
            New purchase bill
          </Link>
        }
      />
      <InventoryNav />
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-white/8 bg-white/4 p-5">
          <p className="font-display text-4xl">{low.length}</p>
          <p className="mt-1 text-sm text-parchment/60">low — still in the tray, order soon</p>
        </div>
        <div className="rounded-2xl border border-white/8 bg-white/4 p-5">
          <p className="font-display text-4xl">{out.length}</p>
          <p className="mt-1 text-sm text-parchment/60">out — nothing on the shelf</p>
        </div>
      </div>
      <div className="mt-6 overflow-x-auto rounded-2xl border border-white/8">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="text-xs tracking-wide text-parchment/50 uppercase">
            <tr>
              <th className="px-4 py-3 font-medium">Piece</th>
              <th className="px-4 py-3 font-medium">Tray</th>
              <th className="px-4 py-3 font-medium">On hand</th>
              <th className="px-4 py-3 font-medium">Reorder</th>
              <th className="px-4 py-3 font-medium">Value left</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {watch.map((r) => (
              <tr key={r.id} className="border-t border-white/8">
                <td className="px-4 py-3">
                  {r.name}
                  <span className="block text-[11px] text-parchment/45">{r.sku}</span>
                </td>
                <td className="px-4 py-3 text-parchment/70">{r.location}</td>
                <td className="px-4 py-3 font-display text-xl">{r.stock}</td>
                <td className="px-4 py-3">{r.reorderAt}</td>
                <td className="px-4 py-3">{money(r.retailValue)}</td>
                <td className="px-4 py-3">
                  <StockPill status={r.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!watch.length ? (
        <p className="mt-6 text-center text-sm text-parchment/55">Nothing on the watch list. The trays are healthy.</p>
      ) : (
        <p className="mt-4 text-sm text-parchment/50">
          Open the{" "}
          <Link to="/owner/inventory/stock" className="text-bronze">
            stock book
          </Link>{" "}
          to correct a count, or write a purchase bill to bring pieces in.
        </p>
      )}
    </div>
  );
}
