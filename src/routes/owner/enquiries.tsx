import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ownerListEnquiries, ownerSetEnquiryStatus } from "@/server/catalogue";
import type { ShopEnquiry } from "@/lib/shop";
import { SITE } from "@/data/site";
import { DeskTabs } from "@/components/owner-tabs";

export const Route = createFileRoute("/owner/enquiries")({
  component: OwnerEnquiries,
});

const STATUSES = ["All", "New", "Open", "Replied", "Closed"] as const;
type StatusTab = (typeof STATUSES)[number];

function OwnerEnquiries() {
  const [rows, setRows] = useState<ShopEnquiry[]>([]);
  const [tab, setTab] = useState<StatusTab>("All");
  const load = useCallback(() => {
    void ownerListEnquiries().then(setRows);
  }, []);
  useEffect(load, [load]);

  const list = useMemo(
    () => (tab === "All" ? rows : rows.filter((e) => e.status === tab)),
    [rows, tab],
  );

  const tabs = STATUSES.map((id) => ({
    id,
    label: id,
    count: id === "All" ? rows.length : rows.filter((e) => e.status === id).length,
  }));

  return (
    <div>
      <h1 className="font-display text-4xl font-semibold">Enquiries</h1>
      <p className="mt-1 text-sm text-parchment/60">Notes from the website form. Reply on WhatsApp.</p>
      <DeskTabs tabs={tabs} value={tab} onChange={setTab} label="Enquiry status" />
      <div className="mt-6 space-y-3">
        {list.map((e) => (
          <article key={e.id} className="rounded-2xl border border-white/8 p-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-medium">{e.subject}</p>
                <p className="text-sm text-parchment/70">
                  {e.name} · {e.phone}
                  {e.email ? ` · ${e.email}` : ""}
                </p>
              </div>
              <select
                value={e.status}
                onChange={(ev) =>
                  void ownerSetEnquiryStatus({ data: { id: e.id, status: ev.target.value } }).then(load)
                }
                className="h-11 rounded-lg border border-white/12 bg-black/30 px-2 text-xs"
                aria-label={`Status for ${e.subject}`}
              >
                {["New", "Open", "Replied", "Closed"].map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-parchment/80">{e.message}</p>
            <a
              href={`https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(`Namaste ${e.name}, regarding ${e.subject}.`)}`}
              className="mt-3 inline-flex min-h-11 items-center text-xs text-bronze"
            >
              Reply on WhatsApp
            </a>
          </article>
        ))}
        {!list.length ? (
          <p className="rounded-2xl border border-dashed border-white/12 px-4 py-10 text-center text-sm text-parchment/50">
            {tab === "All" ? "No enquiries yet." : `Nothing in ${tab}.`}
          </p>
        ) : null}
      </div>
    </div>
  );
}
