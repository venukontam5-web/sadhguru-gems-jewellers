import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { Printer } from "lucide-react";
import { ownerCancelBill, ownerGetBill } from "@/server/bills";
import { BILL_COPY, canAmend, type Bill } from "@/lib/bills";
import { BillSheet } from "@/components/bill-sheet";
import { BillForm } from "@/components/bill-form";
import { BillsNav } from "@/components/bills-nav";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/owner/bills/$id")({
  component: BillView,
});

function BillView() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const billId = Number(id);
  const [bill, setBill] = useState<Bill | null | undefined>(undefined);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    if (!Number.isFinite(billId)) {
      setBill(null);
      return;
    }
    void ownerGetBill({ data: { id: billId } }).then(setBill);
  }, [billId]);
  useEffect(load, [load]);

  if (bill === undefined) return <p className="text-sm text-parchment/60">Opening bill…</p>;
  if (!bill) {
    return (
      <div>
        <p className="text-sm text-parchment/60">No bill with that number.</p>
        <Link to="/owner/bills" className="mt-3 inline-block text-sm text-bronze">
          All bills
        </Link>
      </div>
    );
  }

  const copy = BILL_COPY[bill.kind];
  const amend = canAmend(bill.status);
  const number = bill.number;
  const billPk = bill.id;

  async function cancel() {
    if (!confirm(`Cancel ${number}? It will move to Return & cancelled.`)) return;
    setError(null);
    try {
      await ownerCancelBill({ data: { id: billPk } });
      await navigate({ to: "/owner/bills/returns" });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not cancel.");
    }
  }

  if (editing) {
    return (
      <div>
        <BillsNav />
        <div className="mt-6">
          <BillForm
            kind={bill.kind}
            existing={bill}
            onCancel={() => setEditing(false)}
            onSaved={() => {
              setEditing(false);
              load();
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="print-hidden flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[10px] tracking-[0.2em] text-bronze uppercase">{copy.paper}</p>
          <h1 className="font-display text-4xl font-semibold">{bill.number}</h1>
          <p className="mt-1 text-sm text-parchment/60">
            {copy.title} · {bill.partyName}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" className="bg-bronze text-ink hover:bg-bronze-soft" onClick={() => window.print()}>
            <Printer className="size-4" />
            Print
          </Button>
          {amend && bill.kind === "sale" ? (
            <Button type="button" variant="ivory" className="border border-white/15 bg-transparent text-parchment" asChild>
              <Link to="/owner/bills/returns">Make return</Link>
            </Button>
          ) : null}
          {amend && bill.kind !== "return" ? (
            <Button
              type="button"
              variant="ivory"
              className="border border-white/15 bg-transparent text-parchment"
              onClick={() => void cancel()}
            >
              Cancel bill
            </Button>
          ) : null}
          {amend ? (
            <Button
              type="button"
              variant="ivory"
              className="border border-white/15 bg-transparent text-parchment"
              onClick={() => setEditing(true)}
            >
              Edit
            </Button>
          ) : null}
        </div>
      </div>
      <div className="print-hidden">
        <BillsNav />
      </div>
      {error ? <p className="print-hidden mt-3 text-sm text-red-300">{error}</p> : null}
      <div className="mt-6">
        <BillSheet bill={bill} />
      </div>
    </div>
  );
}
