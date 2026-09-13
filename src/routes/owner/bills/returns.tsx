import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { ownerListBills } from "@/server/bills";
import { BILL_COPY, type Bill } from "@/lib/bills";
import { BillsHeading, BillsNav } from "@/components/bills-nav";
import { BillForm } from "@/components/bill-form";
import { BillTable } from "@/components/bill-list";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/owner/bills/returns")({
  component: ReturnBills,
});

function ReturnBills() {
  const navigate = useNavigate();
  const [returns, setReturns] = useState<Bill[]>([]);
  const [cancelled, setCancelled] = useState<Bill[]>([]);
  const [writing, setWriting] = useState(false);
  const load = useCallback(() => {
    void ownerListBills({ data: { kind: "return" } }).then(setReturns);
    void ownerListBills({ data: { status: "Cancelled" } }).then(setCancelled);
  }, []);
  useEffect(load, [load]);
  const copy = BILL_COPY.return;

  return (
    <div>
      <BillsHeading
        kicker={copy.kicker}
        title={copy.title}
        note={copy.note}
        action={
          writing ? null : (
            <Button type="button" className="bg-bronze text-ink hover:bg-bronze-soft" onClick={() => setWriting(true)}>
              {copy.newLabel}
            </Button>
          )
        }
      />
      <BillsNav />
      <div className="mt-6">
        {writing ? (
          <BillForm
            kind="return"
            onCancel={() => setWriting(false)}
            onSaved={(id) => void navigate({ to: "/owner/bills/$id", params: { id: String(id) } })}
          />
        ) : (
          <div className="space-y-8">
            <div>
              <h2 className="font-display text-2xl">Return bills</h2>
              <p className="mt-1 mb-4 text-sm text-parchment/55">Credit notes against a sale.</p>
              <BillTable rows={returns} kind="return" empty="No returns yet." />
            </div>
            <div>
              <h2 className="font-display text-2xl">Cancelled bills</h2>
              <p className="mt-1 mb-4 text-sm text-parchment/55">
                Sale or purchase bills voided at the counter. They stay on record.
              </p>
              <BillTable rows={cancelled} empty="No cancelled bills." />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
