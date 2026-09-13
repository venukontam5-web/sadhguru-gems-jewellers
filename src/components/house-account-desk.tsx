import { useCallback, useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Barcode,
  BookOpen,
  FileInput,
  PackagePlus,
  Printer,
  Receipt,
  Sparkles,
} from "lucide-react";
import { UserButton } from "@/lib/auth/gates";
import { TouchRegisterCard } from "@/components/touch-id";
import { ownerDashboard, ownerListVisitors } from "@/server/catalogue";
import { ownerBillsSummary } from "@/server/bills";
import { ownerInventorySummary } from "@/server/stock";
import { money, type BillSummary } from "@/lib/bills";
import { money as invMoney, type InventorySummary } from "@/lib/inventory";
import type { ShopVisit } from "@/lib/shop";
import type { AppUser } from "@/lib/auth/use-current-user";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function when(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso.replace("T", " ").slice(0, 16);
  return d.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const card =
  "rounded-[22px] bg-ivory p-5 shadow-card transition-transform duration-150 hover:-translate-y-0.5";

export function HouseAccountDesk({ user }: { user: AppUser }) {
  const [data, setData] = useState<Awaited<ReturnType<typeof ownerDashboard>> | null>(null);
  const [bills, setBills] = useState<BillSummary | null>(null);
  const [inv, setInv] = useState<InventorySummary | null>(null);
  const [visits, setVisits] = useState<ShopVisit[]>([]);

  const load = useCallback(() => {
    void ownerDashboard().then(setData).catch(() => setData(null));
    void ownerBillsSummary().then(setBills).catch(() => setBills(null));
    void ownerInventorySummary().then(setInv).catch(() => setInv(null));
    void ownerListVisitors().then(setVisits).catch(() => setVisits([]));
  }, []);
  useEffect(load, [load]);

  const name = user.displayName || "Venugopal";

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-[22px] bg-ivory p-5 shadow-card">
        <div>
          <p className="text-xs tracking-[0.18em] text-garnet uppercase">House desk</p>
          <p className="mt-1 text-sm text-ink-muted">{user.primaryEmail}</p>
        </div>
        <UserButton />
      </div>

      {user.primaryEmail ? (
        <div className="mt-6">
          <TouchRegisterCard email={user.primaryEmail} name={user.displayName ?? undefined} />
        </div>
      ) : null}

      <div className="mt-8">
        <p className="text-[10px] tracking-[0.2em] text-garnet uppercase">Admin dashboard</p>
        <h2 className="mt-1 font-display text-3xl font-semibold">Namaste, {name}.</h2>
        <p className="mt-2 max-w-xl text-sm text-ink-muted">
          Four books, in this order: customers, bills, stock, scan. Shoppers never see them.
        </p>
      </div>

      <section className="mt-8">
        <p className="text-[10px] tracking-[0.2em] text-garnet uppercase">1 · Customers</p>
        <div className="mt-1 flex items-end justify-between gap-3">
          <h3 className="font-display text-2xl font-semibold">Online visited customers</h3>
          <Link to="/owner/visitors" className="text-sm text-garnet">
            All
          </Link>
        </div>
        <p className="mt-1 text-sm text-ink-muted">Requirement, place, time, contact, mail ID.</p>
        <div className="mt-4 overflow-hidden rounded-[22px] bg-ivory shadow-card">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="text-[10px] tracking-[0.16em] text-ink-muted uppercase">
                <tr>
                  <th className="px-5 py-3 font-medium">Requirement</th>
                  <th className="px-5 py-3 font-medium">Place</th>
                  <th className="px-5 py-3 font-medium">Time</th>
                  <th className="px-5 py-3 font-medium">Contact</th>
                  <th className="px-5 py-3 font-medium">Mail ID</th>
                </tr>
              </thead>
              <tbody>
                {visits.slice(0, 8).map((v) => (
                  <tr key={v.id} className="border-t border-ink/8">
                    <td className="px-5 py-3 capitalize">{v.requirement || v.path}</td>
                    <td className="px-5 py-3 text-ink-muted">{v.place || v.country || "—"}</td>
                    <td className="px-5 py-3 whitespace-nowrap text-ink-muted">{when(v.createdAt)}</td>
                    <td className="px-5 py-3">{v.contact || "—"}</td>
                    <td className="px-5 py-3">{v.email || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!visits.length ? (
              <p className="px-5 py-8 text-sm text-ink-muted">No visits yet.</p>
            ) : null}
          </div>
        </div>
      </section>

      <section className="mt-10">
        <p className="text-[10px] tracking-[0.2em] text-garnet uppercase">2 · Bills and invoice</p>
        <h3 className="mt-1 font-display text-2xl font-semibold">Sales · Purchase · Repair</h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <Link to="/owner/bills/sale" className={card}>
            <Receipt className="size-5 text-bronze" />
            <h4 className="mt-3 font-display text-xl font-semibold">Sales bill</h4>
            <p className="mt-1 text-sm text-ink-muted">Tax invoice from the counter.</p>
            <p className="mt-3 text-xs text-garnet">
              {bills ? `${bills.saleCount} · today ${money(bills.saleToday)}` : "Write a bill"}
            </p>
          </Link>
          <Link to="/owner/bills/purchase" className={card}>
            <FileInput className="size-5 text-bronze" />
            <h4 className="mt-3 font-display text-xl font-semibold">Purchase bill</h4>
            <p className="mt-1 text-sm text-ink-muted">Stock in from the supplier.</p>
            <p className="mt-3 text-xs text-garnet">{bills ? `${bills.purchaseCount} bills` : "Enter their invoice"}</p>
          </Link>
          <Link to="/owner/bills/repair" className={card}>
            <Sparkles className="size-5 text-bronze" />
            <h4 className="mt-3 font-display text-xl font-semibold">Repair and polish</h4>
            <p className="mt-1 text-sm text-ink-muted">Polish, sizing, a broken claw.</p>
            <p className="mt-3 text-xs text-garnet">{bills ? `${bills.repairCount} jobs` : "New job bill"}</p>
          </Link>
        </div>
      </section>

      <section className="mt-10">
        <p className="text-[10px] tracking-[0.2em] text-garnet uppercase">3 · Stock</p>
        <h3 className="mt-1 font-display text-2xl font-semibold">Stock entry · categorywise</h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Link to="/owner/bills/stock" className={card}>
            <PackagePlus className="size-5 text-bronze" />
            <h4 className="mt-3 font-display text-xl font-semibold">Stock entry bill</h4>
            <p className="mt-1 text-sm text-ink-muted">A piece into a category without a supplier bill.</p>
            <p className="mt-3 text-xs text-garnet">{bills ? `${bills.stockCount} entries` : "New entry"}</p>
          </Link>
          <Link to="/owner/inventory/stock" className={card}>
            <BookOpen className="size-5 text-bronze" />
            <h4 className="mt-3 font-display text-xl font-semibold">By category</h4>
            <p className="mt-1 text-sm text-ink-muted">Gemstones, mala, brass, copper — each tray.</p>
            <p className="mt-3 text-xs text-garnet">
              {inv ? `${inv.skus} SKUs · ${inv.pieces} pcs` : "Open the book"}
            </p>
          </Link>
        </div>
        {inv?.byCategory?.length ? (
          <ul className="mt-4 divide-y divide-ink/8 overflow-hidden rounded-[22px] bg-ivory shadow-card">
            {inv.byCategory.map((c) => (
              <li key={c.category} className="flex items-center justify-between px-5 py-3 text-sm">
                <span>{c.category}</span>
                <span className="text-garnet">
                  {c.pieces} pcs · {invMoney(c.retailValue)}
                </span>
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      <section className="mt-10">
        <p className="text-[10px] tracking-[0.2em] text-garnet uppercase">4 · Barcoding</p>
        <h3 className="mt-1 font-display text-2xl font-semibold">Scan print</h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Link to="/owner/print" className={card}>
            <Printer className="size-5 text-bronze" />
            <h4 className="mt-3 font-display text-xl font-semibold">Scan print</h4>
            <p className="mt-1 text-sm text-ink-muted">USB gun or camera. Print the pouch or the A4 bill.</p>
            <p className="mt-3 text-xs text-garnet">Code 128 · SGJ-0001</p>
          </Link>
          <Link to="/owner/inventory/scan" className={card}>
            <Barcode className="size-5 text-bronze" />
            <h4 className="mt-3 font-display text-xl font-semibold">Barcode lookup</h4>
            <p className="mt-1 text-sm text-ink-muted">Type or scan a SKU to open the piece.</p>
          </Link>
        </div>
      </section>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link to="/owner" className={cn(buttonVariants())}>
          Open the full desk
        </Link>
        <Link to="/" className={cn(buttonVariants({ variant: "ghost" }))}>
          ← Back to the shop
        </Link>
      </div>
    </>
  );
}
