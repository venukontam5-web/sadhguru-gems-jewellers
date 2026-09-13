import { useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { ownerListBills } from "@/server/bills";
import { BILL_COPY, type Bill, type BillKind } from "@/lib/bills";
import { BillsHeading, BillsNav } from "@/components/bills-nav";
import { BillForm } from "@/components/bill-form";
import { BillTable } from "@/components/bill-list";
import { Button } from "@/components/ui/button";

const EMPTY: Record<BillKind, string> = {
  sale: "No sale bills yet. Write one when a piece leaves the cabinet.",
  purchase: "No purchase bills yet. Write one when a lot arrives.",
  stock: "No stock entries yet. Use this when a piece arrives without a supplier bill.",
  repair: "No repair bills yet. Polish, sizing, a broken claw.",
  return: "No returns yet.",
  expense: "No expenses yet. Tea, courier, diesel — write them here.",
};

export function BillsKindPage({ kind }: { kind: BillKind }) {
  const navigate = useNavigate();
  const [rows, setRows] = useState<Bill[]>([]);
  const [writing, setWriting] = useState(false);
  const load = useCallback(() => {
    void ownerListBills({ data: { kind } }).then(setRows);
  }, [kind]);
  useEffect(load, [load]);
  const copy = BILL_COPY[kind];

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
            kind={kind}
            onCancel={() => setWriting(false)}
            onSaved={(id) => void navigate({ to: "/owner/bills/$id", params: { id: String(id) } })}
          />
        ) : (
          <BillTable rows={rows} kind={kind} empty={EMPTY[kind]} />
        )}
      </div>
    </div>
  );
}
