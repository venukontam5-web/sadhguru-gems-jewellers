import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { ownerMostSold } from "@/server/bills";
import { money } from "@/lib/bills";
import { ProductPhoto } from "@/components/product-photo";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/owner/selling")({
  component: MostSold,
});

type Row = {
  name: string;
  sku: string;
  imagePath: string;
  productId: number | null;
  qty: number;
  amount: number;
  bills: number;
};

function MostSold() {
  const [month, setMonth] = useState(false);
  const [rows, setRows] = useState<Row[] | null>(null);
  const load = useCallback(() => {
    setRows(null);
    void ownerMostSold({ data: { month } }).then(setRows);
  }, [month]);
  useEffect(load, [load]);
  const top = rows?.[0];
  const max = top?.amount || 1;

  return (
    <div>
      <p className="text-[10px] tracking-[0.2em] text-bronze uppercase">Counter</p>
      <h1 className="font-display text-4xl font-semibold">Most selling product</h1>
      <p className="mt-2 max-w-xl text-sm text-parchment/60">
        What leaves the cabinet most — from sale bills, not from window-shoppers. Cancelled and
        returned bills stay off this list.
      </p>
      <div className="mt-6 flex gap-2">
        {[
          { on: false, label: "All time" },
          { on: true, label: "This month" },
        ].map((t) => (
          <button
            key={t.label}
            type="button"
            onClick={() => setMonth(t.on)}
            className={cn(
              "h-11 rounded-xl px-4 text-sm",
              month === t.on ? "bg-white/12 text-parchment" : "text-parchment/65 hover:bg-white/6",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>
      {!rows ? (
        <p className="mt-8 text-sm text-parchment/60">Counting the tray…</p>
      ) : !rows.length ? (
        <p className="mt-8 text-sm text-parchment/60">No sale bills yet. The list fills when a piece is billed.</p>
      ) : (
        <ol className="mt-8 space-y-3">
          {rows.map((r, i) => (
            <li
              key={`${r.productId ?? r.name}-${i}`}
              className="flex flex-wrap items-center gap-4 rounded-2xl border border-white/8 bg-white/4 p-4"
            >
              <span className="w-8 font-display text-2xl text-bronze">{i + 1}</span>
              <ProductPhoto src={r.imagePath} alt="" rounded="rounded-xl" className="size-16 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="font-medium">{r.name}</p>
                <p className="text-xs text-parchment/50">
                  {r.sku || "No SKU"} · {r.qty} pieces · {r.bills} bills
                </p>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full rounded-full bg-bronze" style={{ width: `${Math.round((r.amount / max) * 100)}%` }} />
                </div>
              </div>
              <p className="font-display text-2xl">{money(r.amount)}</p>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
