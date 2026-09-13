import { useEffect, useMemo, useRef, useState } from "react";
import {
  BILL_COPY,
  BILL_GST_RATES,
  BILL_PAYMENTS,
  BILL_PURITIES,
  defaultGst,
  billTotals,
  emptyLine,
  lineAmount,
  money,
  type Bill,
  type BillKind,
  type BillLine,
} from "@/lib/bills";
import { ownerGetBill, ownerListBills, ownerSaveBill } from "@/server/bills";
import { ownerListProducts } from "@/server/catalogue";
import type { ShopProduct } from "@/lib/shop";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { normalizeSku } from "@/lib/barcode";

const field =
  "h-10 w-full rounded-lg border border-white/12 bg-black/30 px-3 text-sm text-parchment outline-none focus:border-bronze";

type LineDraft = BillLine;

function todayIso() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function BillForm({
  kind,
  existing,
  seedSku,
  onCancel,
  onSaved,
}: {
  kind: BillKind;
  existing?: Bill | null;
  seedSku?: string;
  onCancel: () => void;
  onSaved: (id: number) => void;
}) {
  const copy = BILL_COPY[kind];
  const [partyName, setPartyName] = useState(existing?.partyName ?? "");
  const [phone, setPhone] = useState(existing?.phone ?? "");
  const [gstin, setGstin] = useState(existing?.gstin ?? "");
  const [address, setAddress] = useState(existing?.address ?? "");
  const [billDate, setBillDate] = useState(existing?.billDate || todayIso());
  const [payment, setPayment] = useState(existing?.payment ?? "Cash");
  const [refNumber, setRefNumber] = useState(existing?.refNumber ?? "");
  const [notes, setNotes] = useState(existing?.notes ?? "");
  const [discount, setDiscount] = useState(existing?.discount ?? 0);
  const [gstRate, setGstRate] = useState(existing?.gstRate ?? defaultGst(kind));
  const [againstId, setAgainstId] = useState<number | null>(existing?.againstId ?? null);
  const [lines, setLines] = useState<LineDraft[]>(
    existing?.lines.length ? existing.lines : [emptyLine(0), emptyLine(1)],
  );
  const [products, setProducts] = useState<ShopProduct[]>([]);
  const [sales, setSales] = useState<Bill[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const seeded = useRef(false);
  const [scan, setScan] = useState("");
  const scanRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    void ownerListProducts().then(setProducts).catch(() => setProducts([]));
    if (kind === "return") {
      void ownerListBills({ data: { kind: "sale" } })
        .then((rows) => setSales(rows.filter((b) => b.status !== "Cancelled")))
        .catch(() => setSales([]));
    }
  }, [kind]);

  useEffect(() => {
    if (!seedSku || !products.length || seeded.current) return;
    const p = products.find((x) => x.sku === seedSku || x.slug === seedSku);
    if (!p) return;
    seeded.current = true;
    setLines((prev) => {
      const next = [...prev];
      const line = {
        ...next[0],
        description: p.name,
        rate: p.priceInr,
        qty: 1,
        weightG: 0,
        making: 0,
        productId: p.id,
      };
      next[0] = { ...line, amount: lineAmount(line) };
      return next;
    });
  }, [seedSku, products]);

  const totals = useMemo(() => billTotals(lines, discount, gstRate), [lines, discount, gstRate]);

  function patchLine(i: number, partial: Partial<LineDraft>) {
    setLines((prev) =>
      prev.map((l, idx) => {
        if (idx !== i) return l;
        const next = { ...l, ...partial };
        next.amount = lineAmount(next);
        return next;
      }),
    );
  }

  function pickProduct(i: number, slug: string) {
    const p = products.find((x) => x.slug === slug);
    if (!p) return;
    patchLine(i, { description: p.name, rate: p.priceInr, qty: 1, weightG: 0, making: 0, productId: p.id });
  }

  function addFromSku(raw: string) {
    const sku = normalizeSku(raw);
    if (!sku) return;
    const p = products.find(
      (x) => x.sku === sku || x.slug === sku.toLowerCase() || String(x.id) === sku.replace(/\D/g, ""),
    );
    if (!p) {
      setError(`No piece for ${sku}.`);
      return;
    }
    setError(null);
    setLines((prev) => {
      const existing = prev.findIndex((l) => l.productId === p.id);
      if (existing >= 0) {
        const next = [...prev];
        const line = { ...next[existing], qty: Number(next[existing].qty) + 1 };
        next[existing] = { ...line, amount: lineAmount(line) };
        return next;
      }
      const emptyIdx = prev.findIndex((l) => !l.description.trim());
      const line = {
        ...emptyLine(emptyIdx >= 0 ? emptyIdx : prev.length),
        description: p.name,
        rate: p.priceInr,
        qty: 1,
        weightG: 0,
        making: 0,
        productId: p.id,
      };
      const filled = { ...line, amount: lineAmount(line) };
      if (emptyIdx >= 0) {
        const next = [...prev];
        next[emptyIdx] = filled;
        return next;
      }
      return [...prev, filled];
    });
    setScan("");
    scanRef.current?.focus();
  }

  function pickAgainst(id: number) {
    const src = sales.find((b) => b.id === id);
    setAgainstId(id || null);
    if (!src) return;
    setPartyName(src.partyName);
    setPhone(src.phone);
    setGstin(src.gstin);
    setAddress(src.address);
    setRefNumber(src.number);
    void (async () => {
      const full = await ownerGetBill({ data: { id } });
      if (full?.lines.length) setLines(full.lines);
    })();
  }

  async function save() {
    const filled = lines.filter((l) => l.description.trim());
    if (!filled.length) {
      setError("Add at least one item.");
      return;
    }
    if (kind === "return" && !againstId) {
      setError("Pick the sale bill this return is against.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await ownerSaveBill({
        data: {
          id: existing?.id,
          kind,
          billDate,
          partyName,
          phone,
          gstin,
          address,
          notes,
          payment,
          refNumber,
          againstId,
          discount: Number(discount) || 0,
          gstRate: Number(gstRate) || 0,
          lines: filled.map((l) => ({
            description: l.description,
            hsn: l.hsn,
            purity: l.purity,
            qty: Number(l.qty) || 0,
            weightG: Number(l.weightG) || 0,
            rate: Number(l.rate) || 0,
            making: Number(l.making) || 0,
            productId: l.productId ?? null,
          })),
        },
      });
      onSaved(res.id);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save the bill.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-2xl border border-white/8 bg-white/4 p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[10px] tracking-[0.18em] text-bronze uppercase">{copy.paper}</p>
          <h2 className="font-display text-2xl">{existing ? `Edit ${copy.title}` : copy.newLabel}</h2>
        </div>
        <button type="button" className="text-sm text-parchment/60 hover:text-parchment" onClick={onCancel}>
          Close
        </button>
      </div>

      <form
        className="mt-4"
        onSubmit={(e) => {
          e.preventDefault();
          addFromSku(scan);
        }}
      >
        <label className="text-xs text-parchment/60">
          Scan SKU onto this bill
          <input
            ref={scanRef}
            className={`${field} mt-1 font-mono`}
            value={scan}
            autoComplete="off"
            placeholder="USB gun or SGJ-0019"
            onChange={(e) => setScan(e.target.value)}
          />
        </label>
      </form>

      {kind === "return" ? (
        <label className="mt-4 block text-xs text-parchment/60">
          Against sale bill
          <select
            className={`${field} mt-1`}
            value={againstId ?? ""}
            onChange={(e) => pickAgainst(Number(e.target.value))}
          >
            <option value="">Pick a sale…</option>
            {sales.map((s) => (
              <option key={s.id} value={s.id}>
                {s.number} · {s.partyName} · {money(s.total)}
              </option>
            ))}
          </select>
        </label>
      ) : null}

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <label className="text-xs text-parchment/60">
          {copy.party} name
          <input className={`${field} mt-1`} required value={partyName} onChange={(e) => setPartyName(e.target.value)} />
        </label>
        <label className="text-xs text-parchment/60">
          Phone
          <input className={`${field} mt-1`} value={phone} onChange={(e) => setPhone(e.target.value)} />
        </label>
        <label className="text-xs text-parchment/60">
          Date
          <input className={`${field} mt-1`} type="date" value={billDate} onChange={(e) => setBillDate(e.target.value)} />
        </label>
        <label className="text-xs text-parchment/60">
          Payment
          <select className={`${field} mt-1`} value={payment} onChange={(e) => setPayment(e.target.value)}>
            {BILL_PAYMENTS.map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>
        </label>
        <label className="text-xs text-parchment/60">
          GSTIN (optional)
          <input className={`${field} mt-1`} value={gstin} onChange={(e) => setGstin(e.target.value)} />
        </label>
        <label className="text-xs text-parchment/60 sm:col-span-2">
          Address
          <input className={`${field} mt-1`} value={address} onChange={(e) => setAddress(e.target.value)} />
        </label>
        <label className="text-xs text-parchment/60">
          {kind === "purchase" ? "Supplier invoice no." : "Reference"}
          <input className={`${field} mt-1`} value={refNumber} onChange={(e) => setRefNumber(e.target.value)} />
        </label>
      </div>

      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="text-[10px] tracking-[0.14em] text-parchment/45 uppercase">
            <tr>
              <th className="pb-2 font-medium">Item</th>
              <th className="w-20 pb-2 font-medium">HSN</th>
              <th className="w-28 pb-2 font-medium">Purity</th>
              <th className="w-16 pb-2 font-medium">Qty</th>
              <th className="w-20 pb-2 font-medium">Wt g</th>
              <th className="w-24 pb-2 font-medium">Rate</th>
              <th className="w-24 pb-2 font-medium">Making</th>
              <th className="w-24 pb-2 font-medium">Amount</th>
              <th className="w-10 pb-2" />
            </tr>
          </thead>
          <tbody>
            {lines.map((l, i) => (
              <tr key={i} className="align-top">
                <td className="py-1 pr-1">
                  <input
                    className={field}
                    placeholder="Name of the piece"
                    value={l.description}
                    onChange={(e) => patchLine(i, { description: e.target.value })}
                  />
                  {products.length ? (
                    <select
                      className="mt-1 h-8 w-full rounded-md border border-white/8 bg-black/20 px-2 text-[11px] text-parchment/70"
                      defaultValue=""
                      onChange={(e) => {
                        if (e.target.value) pickProduct(i, e.target.value);
                        e.target.value = "";
                      }}
                    >
                      <option value="">From catalogue…</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.slug}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  ) : null}
                </td>
                <td className="py-1 pr-1">
                  <input className={field} value={l.hsn} onChange={(e) => patchLine(i, { hsn: e.target.value })} />
                </td>
                <td className="py-1 pr-1">
                  <select className={field} value={l.purity} onChange={(e) => patchLine(i, { purity: e.target.value })}>
                    {BILL_PURITIES.map((p) => (
                      <option key={p} value={p}>
                        {p || "—"}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="py-1 pr-1">
                  <input
                    className={field}
                    type="number"
                    min={0}
                    step="0.001"
                    value={l.qty}
                    onChange={(e) => patchLine(i, { qty: Number(e.target.value) })}
                  />
                </td>
                <td className="py-1 pr-1">
                  <input
                    className={field}
                    type="number"
                    min={0}
                    step="0.001"
                    value={l.weightG}
                    onChange={(e) => patchLine(i, { weightG: Number(e.target.value) })}
                  />
                </td>
                <td className="py-1 pr-1">
                  <input
                    className={field}
                    type="number"
                    min={0}
                    value={l.rate}
                    onChange={(e) => patchLine(i, { rate: Number(e.target.value) })}
                  />
                </td>
                <td className="py-1 pr-1">
                  <input
                    className={field}
                    type="number"
                    min={0}
                    value={l.making}
                    onChange={(e) => patchLine(i, { making: Number(e.target.value) })}
                  />
                </td>
                <td className="py-1 pr-1">
                  <p className="flex h-10 items-center px-1 font-medium">{money(l.amount)}</p>
                </td>
                <td className="py-1">
                  <button
                    type="button"
                    className="grid size-10 place-items-center text-parchment/40 hover:text-parchment"
                    onClick={() => setLines((prev) => prev.filter((_, idx) => idx !== i))}
                    aria-label="Remove line"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button
        type="button"
        className="mt-3 inline-flex h-11 items-center gap-2 text-sm text-bronze"
        onClick={() => setLines((prev) => [...prev, emptyLine(prev.length)])}
      >
        <Plus className="size-4" />
        Add line
      </button>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <label className="text-xs text-parchment/60">
          Discount ₹
          <input
            className={`${field} mt-1`}
            type="number"
            min={0}
            value={discount}
            onChange={(e) => setDiscount(Number(e.target.value))}
          />
        </label>
        <label className="text-xs text-parchment/60">
          GST %
          <select className={`${field} mt-1`} value={gstRate} onChange={(e) => setGstRate(Number(e.target.value))}>
            {BILL_GST_RATES.map((r) => (
              <option key={r} value={r}>
                {r}%{r === 3 ? " — jewellery" : ""}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs text-parchment/60 sm:col-span-1">
          Notes
          <input className={`${field} mt-1`} value={notes} onChange={(e) => setNotes(e.target.value)} />
        </label>
      </div>

      <div className="mt-5 flex flex-wrap items-end justify-between gap-3 rounded-xl border border-white/8 bg-black/20 px-4 py-3">
        <div className="text-sm text-parchment/70">
          <p>Subtotal {money(totals.subtotal)}</p>
          <p>
            GST {totals.gstRate}% {money(totals.gstAmount)}
          </p>
          <p className="mt-1 font-display text-2xl text-parchment">Total {money(totals.total)}</p>
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="ivory" className="border border-white/15 bg-transparent text-parchment" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="button" disabled={busy} onClick={() => void save()} className="bg-bronze text-ink hover:bg-bronze-soft">
            {busy ? "Saving…" : "Save bill"}
          </Button>
        </div>
      </div>
      {error ? <p className="mt-3 text-sm text-red-300">{error}</p> : null}
    </div>
  );
}
