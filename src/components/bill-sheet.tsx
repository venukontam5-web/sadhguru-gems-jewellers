import { SITE, fullAddress } from "@/data/site";
import {
  BILL_COPY,
  formatBillDate,
  inrWords,
  money,
  type Bill,
} from "@/lib/bills";
import { Wordmark } from "@/components/logo";

export function BillSheet({ bill }: { bill: Bill }) {
  const copy = BILL_COPY[bill.kind];
  const halfGst = bill.gstRate / 2;
  const partyLabel = bill.kind === "purchase" ? "Supplier" : "Bill to";

  return (
    <article
      id="bill-print"
      className="print-sheet mx-auto max-w-3xl overflow-hidden rounded-2xl bg-[#fbf7f0] text-[#1a1410] shadow-[0_0_0_1px_rgba(255,255,255,0.08)]"
    >
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#1a1410]/10 px-6 py-5 sm:px-8">
        <div>
          <Wordmark className="h-12 max-w-[220px]" />
          <p className="mt-3 max-w-xs text-[11px] leading-relaxed text-[#5c5148]">{fullAddress()}</p>
          <p className="mt-1 text-[11px] text-[#5c5148]">
            {SITE.phone} · {SITE.email}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[10px] tracking-[0.22em] text-[#8c2f39] uppercase">{copy.paper}</p>
          <p className="mt-1 font-display text-2xl font-semibold">{bill.number}</p>
          <p className="mt-1 text-sm text-[#5c5148]">{formatBillDate(bill.billDate)}</p>
          <p className="mt-2 inline-flex rounded-full border border-[#1a1410]/10 px-2.5 py-0.5 text-[11px] tracking-wide uppercase">
            {bill.status}
          </p>
        </div>
      </div>

      <div className="grid gap-4 px-6 py-5 sm:grid-cols-2 sm:px-8">
        <div>
          <p className="text-[10px] tracking-[0.18em] text-[#a68554] uppercase">{partyLabel}</p>
          <p className="mt-1 font-display text-xl font-semibold">{bill.partyName}</p>
          {bill.phone ? <p className="mt-1 text-sm text-[#5c5148]">{bill.phone}</p> : null}
          {bill.address ? <p className="text-sm text-[#5c5148]">{bill.address}</p> : null}
          {bill.gstin ? <p className="mt-1 text-xs text-[#5c5148]">GSTIN {bill.gstin}</p> : null}
        </div>
        <div className="sm:text-right">
          <p className="text-[10px] tracking-[0.18em] text-[#a68554] uppercase">Payment</p>
          <p className="mt-1 text-sm">{bill.payment}</p>
          {bill.refNumber ? (
            <p className="mt-1 text-sm text-[#5c5148]">
              {bill.kind === "purchase" ? "Supplier invoice" : "Reference"} {bill.refNumber}
            </p>
          ) : null}
          {bill.againstNumber ? (
            <p className="mt-1 text-sm text-[#5c5148]">Against {bill.againstNumber}</p>
          ) : null}
        </div>
      </div>

      <div className="px-4 pb-4 sm:px-6">
        <table className="w-full text-left text-[12px] sm:text-sm">
          <thead>
            <tr className="border-y border-[#1a1410]/10 text-[10px] tracking-[0.14em] text-[#5c5148] uppercase">
              <th className="px-2 py-2 font-medium">#</th>
              <th className="px-2 py-2 font-medium">Description</th>
              <th className="hidden px-2 py-2 font-medium sm:table-cell">HSN</th>
              <th className="px-2 py-2 font-medium">Qty</th>
              <th className="px-2 py-2 font-medium">Wt g</th>
              <th className="px-2 py-2 font-medium">Rate</th>
              <th className="hidden px-2 py-2 font-medium sm:table-cell">Making</th>
              <th className="px-2 py-2 text-right font-medium">Amount</th>
            </tr>
          </thead>
          <tbody>
            {bill.lines.map((l, i) => (
              <tr key={l.id ?? i} className="border-b border-[#1a1410]/6">
                <td className="px-2 py-2 text-[#5c5148]">{i + 1}</td>
                <td className="px-2 py-2">
                  {l.description}
                  {l.purity ? <span className="block text-[11px] text-[#5c5148]">{l.purity}</span> : null}
                </td>
                <td className="hidden px-2 py-2 text-[#5c5148] sm:table-cell">{l.hsn}</td>
                <td className="px-2 py-2">{l.qty}</td>
                <td className="px-2 py-2">{l.weightG ? l.weightG : "—"}</td>
                <td className="px-2 py-2">{money(l.rate)}</td>
                <td className="hidden px-2 py-2 sm:table-cell">{l.making ? money(l.making) : "—"}</td>
                <td className="px-2 py-2 text-right font-medium">{money(l.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid gap-4 px-6 pb-6 sm:grid-cols-2 sm:px-8">
        <div>
          <p className="text-[10px] tracking-[0.18em] text-[#a68554] uppercase">In words</p>
          <p className="mt-1 text-sm leading-relaxed">{inrWords(bill.total)}</p>
          {bill.notes ? <p className="mt-3 text-sm text-[#5c5148]">{bill.notes}</p> : null}
        </div>
        <div className="space-y-1.5 text-sm">
          <Row label="Subtotal" value={money(bill.subtotal)} />
          {bill.discount ? <Row label="Discount" value={`− ${money(bill.discount)}`} /> : null}
          {bill.gstRate > 0 ? (
            <>
              <Row label={`CGST ${halfGst}%`} value={money(Math.round(bill.gstAmount / 2))} />
              <Row label={`SGST ${halfGst}%`} value={money(bill.gstAmount - Math.round(bill.gstAmount / 2))} />
            </>
          ) : (
            <Row label="GST" value="Exempt" />
          )}
          <div className="flex items-baseline justify-between border-t border-[#1a1410]/10 pt-2">
            <span className="text-[10px] tracking-[0.18em] uppercase">Grand total</span>
            <span className="font-display text-2xl font-semibold">{money(bill.total)}</span>
          </div>
        </div>
      </div>

      <div className="flex items-end justify-between gap-4 border-t border-[#1a1410]/10 px-6 py-5 sm:px-8">
        <p className="max-w-xs text-[11px] leading-relaxed text-[#5c5148]">
          Stones and metal as named on this bill. Returns within 48 hours with the bill and the piece unused.
          Happiness Auspicious Moment.
        </p>
        <p className="text-right text-[11px] text-[#5c5148]">
          For {SITE.legalName}
          <span className="mt-8 block text-sm text-[#1a1410]">Authorised signatory</span>
        </p>
      </div>
    </article>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 text-[#5c5148]">
      <span>{label}</span>
      <span className="text-[#1a1410]">{value}</span>
    </div>
  );
}
