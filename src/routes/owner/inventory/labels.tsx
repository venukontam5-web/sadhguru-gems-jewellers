import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Printer } from "lucide-react";
import { ownerListStock } from "@/server/stock";
import { type StockRow } from "@/lib/inventory";
import { SkuBarcode } from "@/components/sku-barcode";
import { InventoryHeading, InventoryNav } from "@/components/inventory-nav";
import { Button } from "@/components/ui/button";
import { SITE } from "@/data/site";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/owner/inventory/labels")({
  validateSearch: (s: Record<string, unknown>): { sku?: string } =>
    typeof s.sku === "string" && s.sku ? { sku: s.sku } : {},
  component: LabelSheet,
});

function LabelSheet() {
  const { sku } = Route.useSearch();
  const [rows, setRows] = useState<StockRow[]>([]);
  const [picked, setPicked] = useState<Set<number>>(new Set());
  const load = useCallback(() => {
    void ownerListStock().then((list) => {
      setRows(list);
      if (sku) {
        const hit = list.find((r) => r.sku === sku);
        if (hit) setPicked(new Set([hit.id]));
      }
    });
  }, [sku]);
  useEffect(load, [load]);

  const labels = useMemo(
    () => (picked.size ? rows.filter((r) => picked.has(r.id)) : rows),
    [rows, picked],
  );

  function toggle(id: number) {
    setPicked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div>
      <InventoryHeading
        kicker="Inventory"
        title="Barcode labels"
        note="Code 128 of the house SKU. Print on sticker paper, stick on the pouch or the tray card. A USB gun will read it."
        action={
          <Button type="button" className="print-hidden bg-bronze text-ink hover:bg-bronze-soft" onClick={() => window.print()}>
            <Printer className="size-4" />
            Print labels
          </Button>
        }
      />
      <InventoryNav />

      <div className="print-hidden mt-6 flex flex-wrap gap-2">
        <button
          type="button"
          className="h-10 rounded-lg border border-white/12 px-3 text-sm"
          onClick={() => setPicked(new Set(rows.map((r) => r.id)))}
        >
          All
        </button>
        <button type="button" className="h-10 rounded-lg border border-white/12 px-3 text-sm" onClick={() => setPicked(new Set())}>
          Clear — print all
        </button>
        {["Gemstones", "Crystal", "Mala", "Pearls-Beads", "Brass"].map((c) => (
          <button
            key={c}
            type="button"
            className="h-10 rounded-lg border border-white/12 px-3 text-sm"
            onClick={() => setPicked(new Set(rows.filter((r) => r.category === c).map((r) => r.id)))}
          >
            {c}
          </button>
        ))}
      </div>
      <div className="print-hidden mt-3 flex flex-wrap gap-2">
        {rows.map((r) => (
          <button
            key={r.id}
            type="button"
            onClick={() => toggle(r.id)}
            className={cn(
              "h-10 rounded-lg border px-3 text-xs",
              picked.has(r.id) ? "border-bronze bg-bronze/15 text-bronze" : "border-white/12 text-parchment/65",
            )}
          >
            {r.sku}
          </button>
        ))}
      </div>
      <p className="print-hidden mt-3 text-sm text-parchment/55">
        {labels.length} labels · Code 128 · {SITE.shortName}
      </p>

      <div className="label-sheet mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {labels.map((r) => (
          <article
            key={r.id}
            className="sku-label break-inside-avoid rounded-xl border border-[#1a1410]/12 bg-[#fbf7f0] p-3 text-[#1a1410]"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-[9px] tracking-[0.16em] text-[#8c2f39] uppercase">{SITE.shortName}</p>
                <p className="font-display text-lg font-semibold leading-tight">{r.name}</p>
                <p className="text-[11px] text-[#5c5148]">{r.location}</p>
              </div>
              <p className="font-mono text-xs">{r.sku}</p>
            </div>
            <div className="mt-2 flex justify-center">
              <SkuBarcode value={r.sku} height={44} />
            </div>
            <p className="mt-1 text-center font-mono text-[11px] tracking-[0.2em]">{r.sku}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
