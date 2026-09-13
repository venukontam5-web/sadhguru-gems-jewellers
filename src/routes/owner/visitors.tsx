import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ownerListVisitors } from "@/server/catalogue";
import type { ShopVisit } from "@/lib/shop";
import { DeskTabs } from "@/components/owner-tabs";

export const Route = createFileRoute("/owner/visitors")({
  component: OwnerVisitors,
});

function when(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso.replace("T", " ").slice(0, 19);
  return d.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function OwnerVisitors() {
  const [rows, setRows] = useState<ShopVisit[]>([]);
  const [tab, setTab] = useState<"All" | "Leads" | "Places">("All");
  const [q, setQ] = useState("");
  const load = useCallback(() => {
    void ownerListVisitors().then(setRows);
  }, []);
  useEffect(load, [load]);

  const leads = useMemo(
    () => rows.filter((v) => v.contact || v.email || v.name),
    [rows],
  );
  const places = useMemo(() => {
    const map = new Map<string, number>();
    for (const v of rows) map.set(v.place || v.country || "Unknown", (map.get(v.place || v.country || "Unknown") ?? 0) + 1);
    return [...map.entries()].sort((a, b) => b[1] - a[1]);
  }, [rows]);

  const source = tab === "Leads" ? leads : rows;
  const list = source.filter((v) => {
    if (!q.trim()) return true;
    const hay = `${v.requirement} ${v.place} ${v.contact} ${v.email} ${v.name} ${v.path}`.toLowerCase();
    return hay.includes(q.trim().toLowerCase());
  });

  const tabs = [
    { id: "All", label: "All visits", count: rows.length },
    { id: "Leads", label: "With contact", count: leads.length },
    { id: "Places", label: "By place", count: places.length },
  ] as const;

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[10px] tracking-[0.2em] text-bronze uppercase">People</p>
          <h1 className="font-display text-4xl font-semibold">Online customers</h1>
          <p className="mt-1 text-sm text-parchment/60">
            Requirement, place, time, contact and mail from the shop — pages they opened, notes they sent,
            bills they started.
          </p>
        </div>
        <button type="button" onClick={load} className="h-11 rounded-xl border border-white/15 px-3 text-sm">
          Refresh
        </button>
      </div>

      <DeskTabs tabs={tabs} value={tab} onChange={setTab} label="Customer view" />

      {tab !== "Places" ? (
        <>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search requirement, place, phone, mail…"
            className="mt-6 h-11 w-full max-w-md rounded-xl border border-white/12 bg-black/30 px-3 text-sm outline-none"
          />
          <div className="mt-4 overflow-x-auto rounded-2xl border border-white/8">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="text-xs tracking-wide text-parchment/50 uppercase">
                <tr>
                  <th className="px-4 py-3 font-medium">Requirement</th>
                  <th className="px-4 py-3 font-medium">Place</th>
                  <th className="px-4 py-3 font-medium">Time</th>
                  <th className="px-4 py-3 font-medium">Contact</th>
                  <th className="px-4 py-3 font-medium">Mail ID</th>
                </tr>
              </thead>
              <tbody>
                {list.map((v) => (
                  <tr key={v.id} className="border-t border-white/8">
                    <td className="px-4 py-3">
                      <span className="block font-medium capitalize">{v.requirement || v.path}</span>
                      {v.name ? <span className="text-xs text-parchment/50">{v.name}</span> : null}
                    </td>
                    <td className="px-4 py-3 text-parchment/80">{v.place || v.country || "—"}</td>
                    <td className="px-4 py-3 text-parchment/60 whitespace-nowrap">{when(v.createdAt)}</td>
                    <td className="px-4 py-3">{v.contact || "—"}</td>
                    <td className="px-4 py-3">{v.email || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!list.length ? (
              <p className="px-4 py-10 text-center text-sm text-parchment/50">
                No visits with those details yet. Open the shop in another tab, or wait for an enquiry.
              </p>
            ) : null}
          </div>
        </>
      ) : (
        <ul className="mt-6 divide-y divide-white/8 overflow-hidden rounded-2xl border border-white/8">
          {places.map(([place, n]) => (
            <li key={place} className="flex items-center justify-between gap-3 px-4 py-3">
              <span className="text-sm">{place}</span>
              <span className="tabular-nums text-bronze">{n}</span>
            </li>
          ))}
          {!places.length ? (
            <li className="px-4 py-10 text-center text-sm text-parchment/50">No places yet.</li>
          ) : null}
        </ul>
      )}
    </div>
  );
}
