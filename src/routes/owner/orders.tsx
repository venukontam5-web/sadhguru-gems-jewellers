import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ownerListOrders, ownerSaveOrder, ownerSetOrderStatus } from "@/server/catalogue";
import { ownerListShopOrders } from "@/server/shop-orders";
import { refundRazorpayPayment } from "@/server/razorpay";
import { Button } from "@/components/ui/button";
import { DeskTabs } from "@/components/owner-tabs";
import type { ShopOrder } from "@/lib/shop";
import { inr } from "@/lib/shop";

export const Route = createFileRoute("/owner/orders")({
  component: OwnerOrders,
});

const STATUSES = ["All", "New", "Paid", "Packed", "Shipped", "Delivered"] as const;
type StatusTab = (typeof STATUSES)[number];

function OwnerOrders() {
  const [rows, setRows] = useState<ShopOrder[]>([]);
  const [tab, setTab] = useState<StatusTab>("All");
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [item, setItem] = useState("");
  const [copied, setCopied] = useState<string | null>(null);
  const load = useCallback(() => {
    void ownerListShopOrders().then(setRows).catch(() => {
      void ownerListOrders().then(setRows);
    });
  }, []);
  useEffect(load, [load]);
  const field =
    "h-11 w-full rounded-lg border border-white/12 bg-black/30 px-3 text-sm text-parchment outline-none";

  const list = useMemo(
    () => (tab === "All" ? rows : rows.filter((o) => o.status === tab)),
    [rows, tab],
  );
  const tabs = STATUSES.map((id) => ({
    id,
    label: id,
    count: id === "All" ? rows.length : rows.filter((o) => o.status === id).length,
  }));

  async function copyCode(code: string) {
    await navigator.clipboard.writeText(code);
    setCopied(code);
    window.setTimeout(() => setCopied(null), 1600);
  }

  return (
    <div>
      <h1 className="font-display text-4xl font-semibold">Orders</h1>
      <p className="mt-1 text-sm text-parchment/60">
        Hand-written from the counter, or from the shop cart. Tracking code goes to the customer.
      </p>
      <form
        className="mt-6 grid gap-3 rounded-2xl border border-white/8 p-4 sm:grid-cols-4"
        onSubmit={(e) => {
          e.preventDefault();
          void ownerSaveOrder({
            data: { customerName, phone, item, status: "New" },
          }).then(() => {
            setCustomerName("");
            setPhone("");
            setItem("");
            setTab("New");
            load();
          });
        }}
      >
        <input
          className={field}
          placeholder="Customer"
          required
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
        />
        <input className={field} placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
        <input
          className={field}
          placeholder="Item"
          required
          value={item}
          onChange={(e) => setItem(e.target.value)}
        />
        <Button type="submit" className="h-11 bg-bronze text-ink hover:bg-bronze-soft">
          Add order
        </Button>
      </form>

      <DeskTabs tabs={tabs} value={tab} onChange={setTab} label="Order status" />

      <div className="mt-6 overflow-x-auto rounded-2xl border border-white/8">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="text-xs tracking-wide text-parchment/50 uppercase">
            <tr>
              <th className="px-4 py-3 font-medium">Code</th>
              <th className="px-4 py-3 font-medium">Customer</th>
              <th className="px-4 py-3 font-medium">Item</th>
              <th className="px-4 py-3 font-medium">Pay</th>
              <th className="px-4 py-3 font-medium">Satisfied</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {list.map((o) => (
              <tr key={o.id} className="border-t border-white/8">
                <td className="px-4 py-3 font-medium">
                  <button
                    type="button"
                    className="text-left text-bronze hover:text-bronze-soft"
                    onClick={() => void copyCode(o.code)}
                    title="Copy tracking code"
                  >
                    {o.code}
                    {copied === o.code ? (
                      <span className="ml-2 text-[11px] font-normal text-parchment/50">Copied</span>
                    ) : null}
                  </button>
                </td>
                <td className="px-4 py-3">
                  {o.customerName}
                  <span className="block text-xs text-parchment/50">{o.phone}</span>
                </td>
                <td className="px-4 py-3">{o.item}</td>
                <td className="px-4 py-3 text-xs">
                  {o.payment || "—"}
                  {o.amount ? <span className="block">{inr(o.amount)}</span> : null}
                  {o.paymentStatus ? <span className="block text-parchment/45">{o.paymentStatus}</span> : null}
                </td>
                <td className="px-4 py-3 text-xs">
                  {o.satisfied === "yes" ? "Yes" : o.satisfied === "no" ? "No" : "—"}
                  {o.feedback ? <span className="mt-1 block text-parchment/45">{o.feedback}</span> : null}
                </td>
                <td className="px-4 py-3">
                  <select
                    value={o.status}
                    onChange={(e) =>
                      void ownerSetOrderStatus({ data: { id: o.id, status: e.target.value } }).then(load)
                    }
                    className="h-11 rounded-lg border border-white/12 bg-black/30 px-2 text-xs"
                    aria-label={`Status for ${o.code}`}
                  >
                    {["New", "Paid", "Packed", "Shipped", "Delivered", "Cancelled"].map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                  {o.paymentStatus === "Paid" && o.rzpPaymentId ? (
                    <button
                      type="button"
                      className="mt-2 block text-[11px] text-bronze hover:text-bronze-soft"
                      onClick={() => {
                        if (!confirm(`Refund ${o.code} on Razorpay?`)) return;
                        void refundRazorpayPayment({ data: { code: o.code } })
                          .then(load)
                          .catch((err: unknown) =>
                            setCopied(err instanceof Error ? err.message : "Refund failed"),
                          );
                      }}
                    >
                      Refund
                    </button>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!list.length ? (
          <p className="px-4 py-10 text-center text-sm text-parchment/50">
            {tab === "All" ? "No orders yet. Write one from the counter." : `Nothing ${tab.toLowerCase()}.`}
          </p>
        ) : null}
      </div>
    </div>
  );
}
