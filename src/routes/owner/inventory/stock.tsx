import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Download, Minus, Plus } from "lucide-react";
import { ownerAdjustStock, ownerListStock } from "@/server/stock";
import {
  money,
  STOCK_LOCATIONS,
  STOCK_REASONS,
  type StockRow,
} from "@/lib/inventory";
import { PRODUCT_CATEGORIES } from "@/lib/shop";
import { InventoryHeading, InventoryNav, StockPill } from "@/components/inventory-nav";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/owner/inventory/stock")({
  component: StockBook,
});

const field =
  "h-10 w-full rounded-lg border border-white/12 bg-black/30 px-3 text-sm text-parchment outline-none focus:border-bronze";

function downloadCsv(rows: StockRow[]) {
  const header = ["SKU", "Name", "Category", "Location", "Stock", "Reorder", "Cost", "Price", "Value", "Status"];
  const body = rows.map((r) =>
    [r.sku, r.name, r.category, r.location, r.stock, r.reorderAt, r.costInr, r.priceInr, r.retailValue, r.status]
      .map((c) => `"${String(c).replace(/"/g, '""')}"`)
      .join(","),
  );
  const blob = new Blob([[header.join(","), ...body].join("\n")], { type: "text/csv;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "sgj-stock-book.csv";
  a.click();
  URL.revokeObjectURL(a.href);
}

function StockBook() {
  const [rows, setRows] = useState<StockRow[]>([]);
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("all");
  const [watch, setWatch] = useState(false);
  const [edit, setEdit] = useState<StockRow | null>(null);
  const load = useCallback(() => {
    void ownerListStock().then(setRows);
  }, []);
  useEffect(load, [load]);

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (category !== "all" && r.category !== category) return false;
      if (watch && r.status === "ok") return false;
      if (q && !`${r.name} ${r.sku} ${r.location}`.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [rows, q, category, watch]);

  const groups = useMemo(() => {
    const map = new Map<string, StockRow[]>();
    for (const r of filtered) {
      const key = r.category || "Other";
      const list = map.get(key) ?? [];
      list.push(r);
      map.set(key, list);
    }
    return [...map.entries()];
  }, [filtered]);

  const totalValue = filtered.reduce((s, r) => s + r.retailValue, 0);
  const pieces = filtered.reduce((s, r) => s + r.stock, 0);

  return (
    <div>
      <InventoryHeading
        kicker="Inventory"
        title="Stock by category"
        note="Cabinet count grouped by product category. Tap a row to adjust. Sales and purchases write themselves here."
        action={
          <Button
            type="button"
            variant="ivory"
            className="border border-white/15 bg-transparent text-parchment"
            onClick={() => downloadCsv(filtered)}
          >
            <Download className="size-4" />
            Download CSV
          </Button>
        }
      />
      <InventoryNav />

      <div className="print-hidden mt-6 flex flex-wrap gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search name, SKU, tray…"
          className={cn(field, "max-w-sm")}
        />
        <select className={cn(field, "w-auto")} value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="all">All trays</option>
          {PRODUCT_CATEGORIES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => setWatch((v) => !v)}
          className={cn(
            "h-10 rounded-lg border px-3 text-sm",
            watch ? "border-bronze bg-bronze/15 text-bronze" : "border-white/12 text-parchment/70",
          )}
        >
          Watch only
        </button>
      </div>
      <p className="mt-3 text-sm text-parchment/55">
        {filtered.length} lines · {pieces} pieces · {money(totalValue)} retail · grouped by category
      </p>

      <div className="mt-4 space-y-6">
        {groups.map(([cat, items]) => (
          <div key={cat} className="overflow-x-auto rounded-2xl border border-white/8">
            <div className="flex items-center justify-between px-4 py-3">
              <h2 className="font-display text-2xl">{cat}</h2>
              <p className="text-xs text-parchment/50">
                {items.length} · {items.reduce((s, r) => s + r.stock, 0)} pcs ·{" "}
                {money(items.reduce((s, r) => s + r.retailValue, 0))}
              </p>
            </div>
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="text-xs tracking-wide text-parchment/50 uppercase">
                <tr>
                  <th className="px-4 py-3 font-medium">Piece</th>
                  <th className="px-4 py-3 font-medium">Tray</th>
                  <th className="px-4 py-3 font-medium">Qty</th>
                  <th className="px-4 py-3 font-medium">Value</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {items.map((r) => (
                  <tr
                    key={r.id}
                    className="cursor-pointer border-t border-white/8 hover:bg-white/4"
                    onClick={() => setEdit(r)}
                  >
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-3">
                        <img src={r.imagePath} alt="" className="product-shot size-10 rounded-lg bg-ivory object-contain" loading="lazy" decoding="async" />
                        <span>
                          <span className="block font-medium">{r.name}</span>
                          <span className="text-[11px] text-parchment/45">{r.sku}</span>
                        </span>
                      </span>
                    </td>
                    <td className="px-4 py-3 text-parchment/70">{r.location}</td>
                    <td className="px-4 py-3 font-display text-xl">{r.stock}</td>
                    <td className="px-4 py-3">{money(r.retailValue)}</td>
                    <td className="px-4 py-3">
                      <StockPill status={r.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
      {!filtered.length ? (
        <p className="mt-6 text-center text-sm text-parchment/55">No pieces match that filter.</p>
      ) : null}

      {edit ? <AdjustPanel row={edit} onClose={() => setEdit(null)} onSaved={load} /> : null}
    </div>
  );
}

function AdjustPanel({
  row,
  onClose,
  onSaved,
}: {
  row: StockRow;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [count, setCount] = useState(row.stock);
  const [location, setLocation] = useState(row.location);
  const [reorderAt, setReorderAt] = useState(row.reorderAt);
  const [costInr, setCostInr] = useState(row.costInr);
  const [note, setNote] = useState("Count correction");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const delta = count - row.stock;

  async function save() {
    setBusy(true);
    setError(null);
    try {
      await ownerAdjustStock({
        data: {
          productId: row.id,
          qtyDelta: delta,
          location,
          reorderAt,
          costInr,
          note,
          kind: note === "Sent to karigar" || note === "Back from karigar" ? "karigar" : "adjust",
        },
      });
      onSaved();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-end bg-black/60 p-0 sm:place-items-center sm:p-4">
      <div className="max-h-[92vh] w-full max-w-md overflow-auto rounded-t-2xl border border-white/10 bg-[#0f1c18] p-5 sm:rounded-2xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] tracking-[0.18em] text-bronze uppercase">{row.sku}</p>
            <h2 className="font-display text-2xl">{row.name}</h2>
            <p className="mt-1 text-sm text-parchment/55">
              On hand {row.stock} · {money(row.retailValue)}
            </p>
          </div>
          <button type="button" className="text-parchment/60" onClick={onClose}>
            Close
          </button>
        </div>
        <div className="mt-4">
          <p className="text-xs text-parchment/60">New count</p>
          <div className="mt-1 flex items-center gap-2">
            <button
              type="button"
              className="grid size-11 place-items-center rounded-xl border border-white/12"
              onClick={() => setCount((n) => Math.max(0, n - 1))}
              aria-label="Minus one"
            >
              <Minus className="size-4" />
            </button>
            <input
              className={cn(field, "text-center font-display text-xl")}
              type="number"
              min={0}
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
            />
            <button
              type="button"
              className="grid size-11 place-items-center rounded-xl border border-white/12"
              onClick={() => setCount((n) => n + 1)}
              aria-label="Plus one"
            >
              <Plus className="size-4" />
            </button>
          </div>
          <p className="mt-1 text-xs text-parchment/45">{delta === 0 ? "No qty change" : delta > 0 ? `+${delta} in` : `${delta} out`}</p>
        </div>
        <label className="mt-4 block text-xs text-parchment/60">
          Reason
          <select className={cn(field, "mt-1")} value={note} onChange={(e) => setNote(e.target.value)}>
            {STOCK_REASONS.map((r) => (
              <option key={r}>{r}</option>
            ))}
          </select>
        </label>
        <label className="mt-3 block text-xs text-parchment/60">
          Location
          <select className={cn(field, "mt-1")} value={location} onChange={(e) => setLocation(e.target.value)}>
            {STOCK_LOCATIONS.map((l) => (
              <option key={l}>{l}</option>
            ))}
          </select>
        </label>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <label className="text-xs text-parchment/60">
            Reorder at
            <input
              className={cn(field, "mt-1")}
              type="number"
              min={0}
              value={reorderAt}
              onChange={(e) => setReorderAt(Number(e.target.value))}
            />
          </label>
          <label className="text-xs text-parchment/60">
            Cost ₹
            <input
              className={cn(field, "mt-1")}
              type="number"
              min={0}
              value={costInr}
              onChange={(e) => setCostInr(Number(e.target.value))}
            />
          </label>
        </div>
        {error ? <p className="mt-3 text-sm text-red-300">{error}</p> : null}
        <div className="mt-5 flex gap-2">
          <Button type="button" className="flex-1 bg-bronze text-ink hover:bg-bronze-soft" disabled={busy} onClick={() => void save()}>
            {busy ? "Saving…" : "Save count"}
          </Button>
          <Link to="/owner/products" className="inline-flex h-11 items-center px-3 text-sm text-parchment/60">
            Edit product
          </Link>
        </div>
      </div>
    </div>
  );
}
