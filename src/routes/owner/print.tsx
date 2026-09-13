import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Camera, Printer } from "lucide-react";
import { ownerLookupSku } from "@/server/stock";
import { ownerListBills } from "@/server/bills";
import { money, type StockRow } from "@/lib/inventory";
import { formatBillDate, money as billMoney, type Bill } from "@/lib/bills";
import { normalizeSku } from "@/lib/barcode";
import { SkuBarcode } from "@/components/sku-barcode";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/owner/print")({
  component: PrintScanDesk,
});

function PrintScanDesk() {
  const [code, setCode] = useState("");
  const [hit, setHit] = useState<StockRow | null>(null);
  const [miss, setMiss] = useState("");
  const [busy, setBusy] = useState(false);
  const [bills, setBills] = useState<Bill[]>([]);

  const loadBills = useCallback(() => {
    void ownerListBills({ data: {} }).then((rows) => setBills(rows.slice(0, 8)));
  }, []);
  useEffect(loadBills, [loadBills]);

  async function lookup(raw: string) {
    const sku = normalizeSku(raw);
    if (!sku) return;
    setBusy(true);
    setMiss("");
    try {
      const row = await ownerLookupSku({ data: { sku } });
      if (!row) {
        setHit(null);
        setMiss(sku);
        return;
      }
      setHit(row);
      setCode(row.sku);
    } finally {
      setBusy(false);
    }
  }

  function onScan(e: FormEvent) {
    e.preventDefault();
    void lookup(code);
  }

  return (
    <div>
      <div className="print-hidden flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[10px] tracking-[0.2em] text-bronze uppercase">Counter</p>
          <h1 className="font-display text-4xl font-semibold">Print and barcode scan</h1>
          <p className="mt-2 max-w-xl text-sm text-parchment/60">
            A USB gun types the SKU and presses enter. Print the pouch label, or open the last
            bills on A4.
          </p>
        </div>
      </div>

      <form onSubmit={onScan} className="print-hidden mt-8 max-w-xl">
        <label className="text-xs text-parchment/60">Scan or type SKU</label>
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="SGJ-0001"
          autoFocus
          autoComplete="off"
          className="mt-2 h-14 w-full rounded-xl border border-white/15 bg-black/40 px-4 font-mono text-xl tracking-wide outline-none focus:border-bronze"
        />
        <div className="mt-3 flex flex-wrap gap-2">
          <Button type="submit" disabled={busy} className="bg-bronze text-ink hover:bg-bronze-soft">
            {busy ? "Looking…" : "Look up"}
          </Button>
          <Link
            to="/owner/inventory/scan"
            className={cn(buttonVariants({ variant: "ivory" }), "border border-white/15 bg-transparent text-parchment")}
          >
            <Camera className="size-4" />
            Camera scan
          </Link>
          <Link
            to="/owner/inventory/labels"
            search={hit ? { sku: hit.sku } : undefined}
            className={cn(buttonVariants({ variant: "ivory" }), "border border-white/15 bg-transparent text-parchment")}
          >
            All labels
          </Link>
        </div>
      </form>

      {miss ? (
        <p className="print-hidden mt-4 text-sm text-red-200">No piece for {miss}.</p>
      ) : null}

      {hit ? (
        <article className="mt-6 rounded-2xl border border-white/10 bg-white/4 p-5">
          <div className="flex flex-wrap items-start gap-4">
            <img src={hit.imagePath} alt="" className="product-shot size-24 rounded-xl bg-ivory object-contain" loading="lazy" decoding="async" />
            <div className="min-w-0 flex-1">
              <p className="font-mono text-xs text-bronze">{hit.sku}</p>
              <h2 className="font-display text-3xl">{hit.name}</h2>
              <p className="mt-1 text-sm text-parchment/60">
                {hit.location} · {hit.stock} on hand · {money(hit.priceInr)}
              </p>
            </div>
            <SkuBarcode value={hit.sku} height={48} className="rounded-md" />
          </div>
          <div className="print-hidden mt-4 flex flex-wrap gap-2">
            <Link
              to="/owner/inventory/labels"
              search={{ sku: hit.sku }}
              className={cn(buttonVariants(), "bg-bronze text-ink hover:bg-bronze-soft")}
            >
              <Printer className="size-4" />
              Print label
            </Link>
            <Link
              to="/owner/bills/sale"
              search={{ sku: hit.sku }}
              className={cn(buttonVariants({ variant: "ivory" }), "border border-white/15 bg-transparent text-parchment")}
            >
              Write sale bill
            </Link>
          </div>
        </article>
      ) : null}

      <div className="mt-10 flex flex-wrap items-end justify-between gap-3">
        <h2 className="font-display text-2xl">Recent bills to print</h2>
        <Link to="/owner/bills" className="print-hidden text-sm text-bronze hover:text-bronze-soft">
          All bills →
        </Link>
      </div>
      <div className="mt-4 overflow-x-auto rounded-2xl border border-white/8">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead className="text-xs tracking-wide text-parchment/50 uppercase">
            <tr>
              <th className="px-4 py-3 font-medium">Bill</th>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Party</th>
              <th className="px-4 py-3 text-right font-medium">Total</th>
              <th className="print-hidden px-4 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {bills.map((b) => (
              <tr key={b.id} className="border-t border-white/8">
                <td className="px-4 py-3 font-medium">{b.number}</td>
                <td className="px-4 py-3 text-parchment/70">{formatBillDate(b.billDate)}</td>
                <td className="px-4 py-3">{b.partyName}</td>
                <td className="px-4 py-3 text-right">{billMoney(b.total)}</td>
                <td className="print-hidden px-4 py-3 text-right">
                  <Link to="/owner/bills/$id" params={{ id: String(b.id) }} className="text-bronze hover:text-bronze-soft">
                    Print
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
