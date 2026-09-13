import { Link } from "@tanstack/react-router";
import { formatBillDate, money, type Bill, type BillKind, BILL_COPY } from "@/lib/bills";

export function BillTable({
  rows,
  kind,
  empty,
}: {
  rows: Bill[];
  kind?: BillKind;
  empty: string;
}) {
  if (!rows.length) {
    return (
      <p className="rounded-2xl border border-dashed border-white/12 px-4 py-10 text-center text-sm text-parchment/55">
        {empty}
      </p>
    );
  }
  return (
    <div className="overflow-x-auto rounded-2xl border border-white/8">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead className="text-xs tracking-wide text-parchment/50 uppercase">
          <tr>
            <th className="px-4 py-3 font-medium">Bill no.</th>
            <th className="px-4 py-3 font-medium">Date</th>
            <th className="px-4 py-3 font-medium">{kind ? BILL_COPY[kind].party : "Party"}</th>
            <th className="px-4 py-3 font-medium">Payment</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 text-right font-medium">Total</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((b) => (
            <tr key={b.id} className="border-t border-white/8 hover:bg-white/4">
              <td className="px-4 py-3">
                <Link to="/owner/bills/$id" params={{ id: String(b.id) }} className="font-medium text-bronze hover:text-bronze-soft">
                  {b.number}
                </Link>
                {b.againstNumber ? (
                  <span className="block text-[11px] text-parchment/45">vs {b.againstNumber}</span>
                ) : null}
              </td>
              <td className="px-4 py-3 text-parchment/70">{formatBillDate(b.billDate)}</td>
              <td className="px-4 py-3">
                {b.partyName}
                {b.phone ? <span className="block text-xs text-parchment/50">{b.phone}</span> : null}
              </td>
              <td className="px-4 py-3 text-parchment/70">{b.payment}</td>
              <td className="px-4 py-3">
                <span className="text-bronze">{b.status}</span>
              </td>
              <td className="px-4 py-3 text-right font-medium">{money(b.total)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
