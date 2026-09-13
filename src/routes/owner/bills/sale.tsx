import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { ownerListBills } from "@/server/bills";
import { BILL_COPY, type Bill } from "@/lib/bills";
import { BillsHeading, BillsNav } from "@/components/bills-nav";
import { BillForm } from "@/components/bill-form";
import { BillTable } from "@/components/bill-list";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/owner/bills/sale")({
  validateSearch: (s: Record<string, unknown>): { sku?: string } =>
    typeof s.sku === "string" && s.sku ? { sku: s.sku } : {},
  component: SaleBills,
});

function SaleBills() {
  const navigate = useNavigate();
  const { sku } = Route.useSearch();
  const [rows, setRows] = useState<Bill[]>([]);
  const [writing, setWriting] = useState(Boolean(sku));
  const load = useCallback(() => {
    void ownerListBills({ data: { kind: "sale" } }).then(setRows);
  }, []);
  useEffect(load, [load]);
  useEffect(() => {
    if (sku) setWriting(true);
  }, [sku]);
  const copy = BILL_COPY.sale;

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
            kind="sale"
            seedSku={sku}
            onCancel={() => setWriting(false)}
            onSaved={(id) => void navigate({ to: "/owner/bills/$id", params: { id: String(id) } })}
          />
        ) : (
          <BillTable rows={rows} kind="sale" empty="No sale bills yet. Write one when a piece leaves the cabinet." />
        )}
      </div>
    </div>
  );
}
