import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { Receipt, FileInput, Undo2, PackagePlus, Sparkles, Wallet } from "lucide-react";
import { ownerBillsSummary } from "@/server/bills";
import { BILL_COPY, money, type BillSummary } from "@/lib/bills";
import { BillsHeading, BillsNav } from "@/components/bills-nav";
import { BillTable } from "@/components/bill-list";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/owner/bills/")({
  component: BillsHub,
});

function BillsHub() {
  const [data, setData] = useState<BillSummary | null>(null);
  const load = useCallback(() => {
    void ownerBillsSummary().then(setData);
  }, []);
  useEffect(load, [load]);

  if (!data) return <p className="text-sm text-parchment/60">Loading bills…</p>;

  const cards = [
    {
      to: "/owner/bills/sale" as const,
      icon: Receipt,
      title: BILL_COPY.sale.title,
      body: "Tax invoices from the counter.",
      stat: `${data.saleCount} bills · ${money(data.saleTotal)}`,
      extra: `Today ${money(data.saleToday)}`,
    },
    {
      to: "/owner/bills/stock" as const,
      icon: PackagePlus,
      title: BILL_COPY.stock.title,
      body: "Opening stock or a piece without a supplier bill.",
      stat: `${data.stockCount} entries · ${money(data.stockTotal)}`,
      extra: "Adds to the cabinet",
    },
    {
      to: "/owner/bills/purchase" as const,
      icon: FileInput,
      title: BILL_COPY.purchase.title,
      body: "Stock in from the supplier.",
      stat: `${data.purchaseCount} bills · ${money(data.purchaseTotal)}`,
      extra: "Keep their invoice number",
    },
    {
      to: "/owner/bills/repair" as const,
      icon: Sparkles,
      title: BILL_COPY.repair.title,
      body: "Polish, sizing, a broken claw.",
      stat: `${data.repairCount} bills · ${money(data.repairTotal)}`,
      extra: "Service GST usually 18%",
    },
    {
      to: "/owner/bills/returns" as const,
      icon: Undo2,
      title: BILL_COPY.return.title,
      body: "Credit notes and cancelled bills.",
      stat: `${data.returnCount} returns · ${data.cancelledCount} cancelled`,
      extra: money(data.returnTotal),
    },
    {
      to: "/owner/bills/expenses" as const,
      icon: Wallet,
      title: BILL_COPY.expense.title,
      body: "Tea, courier, diesel, a karigar’s day.",
      stat: `${data.expenseCount} vouchers · ${money(data.expenseTotal)}`,
      extra: "Cabinet does not move",
    },
  ];

  return (
    <div>
      <BillsHeading
        kicker="Bills & invoices"
        title="Bills and invoices"
        note="Sale, stock entry, purchase, repair, return, and daily expenses. Save, then print on A4."
      />
      <BillsNav />
      <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((c) => (
          <Link
            key={c.to}
            to={c.to}
            className="rounded-2xl border border-white/8 bg-white/4 p-5 transition-colors hover:border-bronze/40 hover:bg-white/6"
          >
            <c.icon className="size-5 text-bronze" />
            <h2 className="mt-3 font-display text-2xl">{c.title}</h2>
            <p className="mt-1 text-sm text-parchment/55">{c.body}</p>
            <p className="mt-4 text-sm text-parchment">{c.stat}</p>
            <p className="mt-1 text-xs text-bronze">{c.extra}</p>
          </Link>
        ))}
      </div>
      <div className="mt-8 flex items-center justify-between">
        <h2 className="font-display text-2xl">Recent bills</h2>
        <Link to="/owner/bills/sale" className={cn(buttonVariants({ size: "sm" }), "bg-bronze text-ink hover:bg-bronze-soft")}>
          New sale bill
        </Link>
      </div>
      <div className="mt-4">
        <BillTable rows={data.recent} empty="No bills yet. Write the first sale from the counter." />
      </div>
    </div>
  );
}
