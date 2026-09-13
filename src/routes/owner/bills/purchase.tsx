import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { ownerListBills } from "@/server/bills";
import { BILL_COPY, type Bill } from "@/lib/bills";
import { BillsHeading, BillsNav } from "@/components/bills-nav";
import { BillForm } from "@/components/bill-form";
import { BillTable } from "@/components/bill-list";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/owner/bills/purchase")({
  component: PurchaseBills,
});

function PurchaseBills() {
  const navigate = useNavigate();
  const [rows, setRows] = useState<Bill[]>([]);
  const [writing, setWriting] = useState(false);
  const load = useCallback(() => {
    void ownerListBills({ data: { kind: "purchase" } }).then(setRows);
  }, []);
  useEffect(load, [load]);
  const copy = BILL_COPY.purchase;

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
            kind="purchase"
            onCancel={() => setWriting(false)}
            onSaved={(id) => void navigate({ to: "/owner/bills/$id", params: { id: String(id) } })}
          />
        ) : (
          <BillTable
            rows={rows}
            kind="purchase"
            empty="No purchase bills yet. Enter a supplier invoice when stock comes in."
          />
        )}
      </div>
    </div>
  );
}
