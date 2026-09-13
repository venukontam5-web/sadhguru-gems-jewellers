import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ownerListStockMoves } from "@/server/stock";
import { signedQty, STOCK_KIND_LABEL, STOCK_KINDS, type StockKind, type StockMove } from "@/lib/inventory";
import { InventoryHeading, InventoryNav } from "@/components/inventory-nav";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/owner/inventory/ledger")({
  component: StockLedger,
});

function StockLedger() {
  const [rows, setRows] = useState<StockMove[]>([]);
  const [kind, setKind] = useState("all");
  const [q, setQ] = useState("");
  const load = useCallback(() => {
    void ownerListStockMoves({ data: { kind: kind === "all" ? undefined : kind } }).then(setRows);
  }, [kind]);
  useEffect(load, [load]);

  const filtered = useMemo(() => {
    if (!q) return rows;
    const n = q.toLowerCase();
    return rows.filter((m) => `${m.productName} ${m.sku} ${m.billNumber} ${m.note}`.toLowerCase().includes(n));
  }, [rows, q]);

  return (
    <div>
      <InventoryHeading
        kicker="Inventory"
        title="In & out"
        note="Every movement of the cabinet — opening count, purchase, sale, return, karigar and correction."
      />
      <InventoryNav />
      <div className="mt-6 flex flex-wrap gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search piece or bill…"
          className="h-10 max-w-sm rounded-lg border border-white/12 bg-black/30 px-3 text-sm outline-none focus:border-bronze"
        />
        <div className="flex flex-wrap gap-1">
          <KindChip id="all" label="All" on={kind === "all"} pick={setKind} />
          {STOCK_KINDS.map((k) => (
            <KindChip key={k} id={k} label={STOCK_KIND_LABEL[k]} on={kind === k} pick={setKind} />
          ))}
        </div>
      </div>
      <div className="mt-4 overflow-x-auto rounded-2xl border border-white/8">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="text-xs tracking-wide text-parchment/50 uppercase">
            <tr>
              <th className="px-4 py-3 font-medium">When</th>
              <th className="px-4 py-3 font-medium">Piece</th>
              <th className="px-4 py-3 font-medium">Kind</th>
              <th className="px-4 py-3 font-medium">Bill</th>
              <th className="px-4 py-3 text-right font-medium">Qty</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((m) => (
              <tr key={m.id} className="border-t border-white/8">
                <td className="px-4 py-3 text-parchment/60">
                  {m.createdAt.slice(0, 16).replace("T", " ")}
                </td>
                <td className="px-4 py-3">
                  {m.productName}
                  <span className="block text-[11px] text-parchment/45">{m.note}</span>
                </td>
                <td className="px-4 py-3 text-parchment/70">{STOCK_KIND_LABEL[m.kind as StockKind] ?? m.kind}</td>
                <td className="px-4 py-3">
                  {m.billId ? (
                    <Link to="/owner/bills/$id" params={{ id: String(m.billId) }} className="text-bronze">
                      {m.billNumber}
                    </Link>
                  ) : (
                    <span className="text-parchment/40">—</span>
                  )}
                </td>
                <td className={cn("px-4 py-3 text-right font-medium", m.qty < 0 ? "text-red-200" : "text-bronze")}>
                  {signedQty(m.qty)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!filtered.length ? (
        <p className="mt-6 text-center text-sm text-parchment/55">No movements in this filter.</p>
      ) : null}
    </div>
  );
}

function KindChip({
  id,
  label,
  on,
  pick,
}: {
  id: string;
  label: string;
  on: boolean;
  pick: (v: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => pick(id)}
      className={cn(
        "h-10 rounded-lg border px-3 text-sm",
        on ? "border-bronze bg-bronze/15 text-bronze" : "border-white/12 text-parchment/70",
      )}
    >
      {label}
    </button>
  );
}
