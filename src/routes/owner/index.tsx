import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { ownerDashboard } from "@/server/catalogue";
import { ownerBillsSummary } from "@/server/bills";
import { ownerInventorySummary } from "@/server/stock";
import { ownerAiBrief, ownerAiReach } from "@/server/ai-desk";
import { addStaff, listStaff, removeStaff, setStaffRole } from "@/server/staff";
import { buttonVariants } from "@/components/ui/button";
import { DeskTabs } from "@/components/owner-tabs";
import { cn } from "@/lib/utils";
import { useDeskAccess } from "@/lib/use-staff";
import { DESK_ROLES, hasCap, ROLE_COPY, type DeskRole } from "@/lib/rbac";
import {
  Barcode,
  Bot,
  BookOpen,
  FileInput,
  Images,
  MessageSquare,
  Palette,
  Printer,
  Receipt,
  Sparkles,
  ShoppingBag,
  Star,
  Share2,
  Users,
  PackagePlus,
  KeyRound,
  BrainCircuit,
} from "lucide-react";
import { money, type BillSummary } from "@/lib/bills";
import { money as invMoney, type InventorySummary } from "@/lib/inventory";
import { SEED_REVIEWS } from "@/data/reviews";
import { SITE } from "@/data/site";
import type { ShopVisit } from "@/lib/shop";

export const Route = createFileRoute("/owner/")({
  component: OwnerHome,
});

const DASH_TABS = [
  { id: "today", label: "Overview" },
  { id: "ai", label: "AI" },
  { id: "customers", label: "1 · Customers" },
  { id: "counter", label: "2 · Bills" },
  { id: "cabinet", label: "3 · Stock" },
  { id: "scan", label: "4 · Scan" },
  { id: "shop", label: "Shop" },
  { id: "people", label: "Team" },
] as const;

type DashTab = (typeof DASH_TABS)[number]["id"];

function OwnerHome() {
  const { can, role, user } = useDeskAccess();
  const [data, setData] = useState<Awaited<ReturnType<typeof ownerDashboard>> | null>(null);
  const [bills, setBills] = useState<BillSummary | null>(null);
  const [inv, setInv] = useState<InventorySummary | null>(null);
  const tabs = DASH_TABS.filter((t) => {
    if (t.id === "today") return true;
    if (t.id === "ai") return can("enquiries");
    if (t.id === "customers") return can("visitors") || can("enquiries");
    if (t.id === "counter") return can("bills");
    if (t.id === "cabinet") return can("inventory");
    if (t.id === "scan") return can("inventory");
    if (t.id === "shop") return can("slides") || can("appearance");
    if (t.id === "people") return can("enquiries") || can("team") || can("orders");
    return false;
  });
  const [tab, setTab] = useState<DashTab>("today");
  const load = useCallback(() => {
    void ownerDashboard().then(setData);
    if (hasCap(role, "bills")) void ownerBillsSummary().then(setBills).catch(() => setBills(null));
    if (hasCap(role, "inventory")) void ownerInventorySummary().then(setInv).catch(() => setInv(null));
  }, [role]);
  useEffect(load, [load]);
  useEffect(() => {
    if (!tabs.some((t) => t.id === tab)) setTab("today");
  }, [tab, tabs]);

  if (!data) return <p className="text-sm text-parchment/60">Loading dashboard…</p>;

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[10px] tracking-[0.2em] text-bronze uppercase">
            {role ? ROLE_COPY[role].label : "Desk"}
          </p>
          <h1 className="font-display text-4xl font-semibold">Admin dashboard</h1>
          <p className="mt-1 max-w-xl text-sm text-parchment/60">
            Four books: customers, bills, stock, scan. Namaste
            {user?.displayName ? `, ${user.displayName}` : ""}.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            to="/owner/social"
            className={cn(buttonVariants({ size: "sm" }), "border border-white/15 bg-white/5 text-parchment hover:bg-white/10", !can("social") && "hidden")}
          >
            <Share2 className="size-4" />
            Post to Instagram, Facebook & YouTube
          </Link>
          <Link
            to="/owner/bills/sale"
            className={cn(buttonVariants({ size: "sm" }), "bg-bronze text-ink hover:bg-bronze-soft", !can("bills") && "hidden")}
          >
            <Receipt className="size-4" />
            New sale bill
          </Link>
          <button type="button" onClick={load} className={cn(buttonVariants({ variant: "ivory", size: "sm" }))}>
            Refresh
          </button>
          <Link
            to="/owner/ai"
            className={cn(buttonVariants({ size: "sm" }), "border border-white/15 bg-white/5 text-parchment hover:bg-white/10", !can("enquiries") && "hidden")}
          >
            <BrainCircuit className="size-4" />
            Advanced AI
          </Link>
          <Link
            to="/owner/keys"
            className={cn(buttonVariants({ size: "sm" }), "border border-white/15 bg-white/5 text-parchment hover:bg-white/10", !can("appearance") && "hidden")}
          >
            <KeyRound className="size-4" />
            API keys
          </Link>
          <Link
            to="/owner/auto"
            className={cn(buttonVariants({ size: "sm" }), "border border-white/15 bg-white/5 text-parchment hover:bg-white/10", !can("appearance") && "hidden")}
          >
            Auto hang
          </Link>
        </div>
      </div>

      <DeskTabs tabs={tabs} value={tab} onChange={setTab} label="Dashboard" />

      {tab === "today" ? <TodayPane data={data} bills={bills} inv={inv} /> : null}
      {tab === "ai" ? <HouseAiStrip full /> : null}
      {tab === "customers" ? <CustomersPane data={data} /> : null}
      {tab === "counter" ? <CounterPane bills={bills} /> : null}
      {tab === "cabinet" ? <CabinetPane inv={inv} /> : null}
      {tab === "scan" ? <ScanPane /> : null}
      {tab === "shop" ? <ShopPane data={data} /> : null}
      {tab === "people" ? <PeoplePane data={data} /> : null}
    </div>
  );
}

type Dash = Awaited<ReturnType<typeof ownerDashboard>>;

const toolCard =
  "rounded-2xl border border-white/8 bg-white/4 p-5 transition-colors hover:border-bronze/40";

function HouseAiStrip({ full }: { full?: boolean }) {
  const [brief, setBrief] = useState<Awaited<ReturnType<typeof ownerAiBrief>> | null>(null);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  useEffect(() => {
    void ownerAiBrief()
      .then((res) => {
        setBrief(res);
        setNote(`Collected ${res.collected}. Autopilot ${res.autopilot ? "on" : "off"}.`);
      })
      .catch(() => setNote("Book will fill from visits. Channels below are live."));
  }, []);
  const nextMail = brief?.mailQueue[0];
  const nextWa = brief?.waQueue[0];
  async function reach(id: number, channel: "mail" | "whatsapp") {
    setBusy(true);
    try {
      const res = await ownerAiReach({ data: { id, channel } });
      if (res.href) window.open(res.href, "_blank", "noopener");
      setNote(`Reached ${res.name || "them"}.`);
      setBrief(await ownerAiBrief());
    } finally {
      setBusy(false);
    }
  }
  const importUrl = brief?.importUrl ?? `https://vercel.com/new/import?s=${SITE.githubUrl}`;
  return (
    <section className="rounded-2xl border border-bronze/40 bg-white p-5 text-ink">
      <p className="text-[10px] tracking-[0.2em] text-bronze uppercase">Advanced AI · running</p>
      <h2 className="mt-1 font-display text-2xl">
        {brief ? `${brief.collected} on the book · autopilot ${brief.autopilot ? "on" : "off"}` : "All-in-one control"}
      </h2>
      {note ? <p className="mt-1 text-sm text-bronze">{note}</p> : <p className="mt-1 text-sm text-ink-muted">Collecting visits and enquiries…</p>}
      <div className="mt-3 flex flex-wrap gap-2">
        {(brief?.needs.length ? brief.needs : [{ need: "Navratna", n: 0 }, { need: "Pukhraj", n: 0 }, { need: "Repair", n: 0 }])
          .slice(0, 6)
          .map((n) => (
            <span key={n.need} className="rounded-full bg-ivory px-3 py-1 text-xs">
              {n.need}
              {n.n ? ` · ${n.n}` : ""}
            </span>
          ))}
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {nextMail ? (
          <button
            type="button"
            disabled={busy}
            onClick={() => void reach(nextMail.id, "mail")}
            className={cn(buttonVariants({ size: "sm" }), "bg-bronze text-ink")}
          >
            Mail {nextMail.name}
          </button>
        ) : (
          <a href={SITE.emailHref} className={cn(buttonVariants({ size: "sm" }), "bg-bronze text-ink")}>
            House mail
          </a>
        )}
        {nextWa ? (
          <button
            type="button"
            disabled={busy}
            onClick={() => void reach(nextWa.id, "whatsapp")}
            className={cn(buttonVariants({ size: "sm", variant: "outline" }))}
          >
            WhatsApp {nextWa.name}
          </button>
        ) : (
          <a href={`https://wa.me/${SITE.whatsapp}`} target="_blank" rel="noreferrer" className={cn(buttonVariants({ size: "sm", variant: "outline" }))}>
            WhatsApp Business
          </a>
        )}
        <a href={SITE.facebook} target="_blank" rel="noreferrer" className={cn(buttonVariants({ size: "sm", variant: "outline" }))}>
          Facebook
        </a>
        <a href={SITE.instagram} target="_blank" rel="noreferrer" className={cn(buttonVariants({ size: "sm", variant: "outline" }))}>
          Instagram
        </a>
        <a href={importUrl} target="_blank" rel="noreferrer" className={cn(buttonVariants({ size: "sm", variant: "outline" }))}>
          Deploy · Authorize Vercel
        </a>
        <Link to="/owner/ai" className={cn(buttonVariants({ size: "sm", variant: "ghost" }))}>
          Full AI desk
        </Link>
      </div>
      {full ? (
        <ul className="mt-4 space-y-2">
          {(brief?.customers ?? []).slice(0, 8).map((p, i) => (
            <li key={`${p.email}-${i}`} className="flex flex-wrap justify-between gap-2 border-t border-ink/10 pt-2 text-sm">
              <span>
                {p.name} · {p.need}
              </span>
              <span className="text-ink-muted">{p.place || p.email || p.contact}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}

function VisitTable({ rows }: { rows: ShopVisit[] }) {
  return (
    <div className="mt-4 overflow-x-auto rounded-2xl border border-white/8">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead className="text-[10px] tracking-[0.16em] text-parchment/50 uppercase">
          <tr>
            <th className="px-4 py-3 font-medium">Requirement</th>
            <th className="px-4 py-3 font-medium">Place</th>
            <th className="px-4 py-3 font-medium">Time</th>
            <th className="px-4 py-3 font-medium">Contact</th>
            <th className="px-4 py-3 font-medium">Mail ID</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((v) => (
            <tr key={v.id} className="border-t border-white/8">
              <td className="px-4 py-3 capitalize">{v.requirement || v.path}</td>
              <td className="px-4 py-3 text-parchment/70">{v.place || v.country || "—"}</td>
              <td className="px-4 py-3 whitespace-nowrap text-parchment/60">
                {v.createdAt.replace("T", " ").slice(0, 16)}
              </td>
              <td className="px-4 py-3">{v.contact || "—"}</td>
              <td className="px-4 py-3">{v.email || "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {!rows.length ? (
        <p className="px-4 py-8 text-center text-sm text-parchment/50">No online visits yet.</p>
      ) : null}
    </div>
  );
}

function CustomersPane({ data }: { data: Dash }) {
  return (
    <div className="mt-6">
      <p className="text-[10px] tracking-[0.2em] text-bronze uppercase">1 · Customers</p>
      <h2 className="mt-1 font-display text-3xl">Online visited customers</h2>
      <p className="mt-1 text-sm text-parchment/55">Requirement, place, time, contact, mail ID.</p>
      <VisitTable rows={data.recentVisits} />
      <Link to="/owner/visitors" className="mt-4 inline-block text-sm text-bronze">
        Full customer book →
      </Link>
      <Link to="/owner/leads" className={cn(toolCard, "mt-4 block")}>
        <Bot className="size-5 text-bronze" />
        <h3 className="mt-3 font-display text-2xl">Sales agent</h3>
        <p className="mt-1 text-sm text-parchment/55">
          Collect website leads, reach on WhatsApp, set a reminder. Does not scrape social apps.
        </p>
      </Link>
    </div>
  );
}

function ScanPane() {
  return (
    <div className="mt-6">
      <p className="text-[10px] tracking-[0.2em] text-bronze uppercase">4 · Barcoding</p>
      <h2 className="mt-1 font-display text-3xl">Scan print</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <Link to="/owner/print" className={toolCard}>
          <Printer className="size-5 text-bronze" />
          <h3 className="mt-3 font-display text-2xl">Scan print</h3>
          <p className="mt-1 text-sm text-parchment/55">USB gun or camera. Print the pouch or the A4 bill.</p>
        </Link>
        <Link to="/owner/inventory/scan" className={toolCard}>
          <Barcode className="size-5 text-bronze" />
          <h3 className="mt-3 font-display text-2xl">Barcode lookup</h3>
          <p className="mt-1 text-sm text-parchment/55">Type or scan a SKU to open the piece.</p>
        </Link>
        <Link to="/owner/inventory/labels" className={toolCard}>
          <Printer className="size-5 text-bronze" />
          <h3 className="mt-3 font-display text-2xl">Pouch labels</h3>
          <p className="mt-1 text-sm text-parchment/55">Print Code 128 for a tray.</p>
        </Link>
      </div>
    </div>
  );
}

function TodayPane({
  data,
  bills,
  inv,
}: {
  data: Dash;
  bills: BillSummary | null;
  inv: InventorySummary | null;
}) {
  const slides = data.slideList.filter((s) => s.kind !== "story");
  return (
    <div className="mt-6 space-y-8">
      <HouseAiStrip />
      <Link
        to="/owner/auto"
        className="block rounded-2xl border border-white/8 bg-white/4 p-5 no-underline"
      >
        <p className="text-[10px] tracking-[0.2em] text-bronze uppercase">Auto hang</p>
        <p className="mt-1 font-display text-2xl">GitHub → Vercel, bugs solved on this desk</p>
        <p className="mt-1 font-mono text-xs text-parchment/50">Auto mode · sync · paste a red log</p>
      </Link>
      <div className="flex gap-3 overflow-x-auto pb-1">
        {slides.map((s) => (
          <Link key={s.id} to="/owner/slides" className="relative shrink-0">
            <img
              src={s.imagePath}
              alt={s.title}
              loading="lazy"
              decoding="async"
              className={cn(
                "rounded-2xl object-cover",
                s.kind === "poster" ? "h-20 w-36" : "h-24 w-16",
              )}
            />
          </Link>
        ))}
        <Link
          to="/owner/slides"
          className="grid h-24 w-24 shrink-0 place-items-center rounded-2xl border border-dashed border-bronze/50 text-2xl text-bronze"
        >
          +
        </Link>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          [data.visits, "customers"],
          [bills ? bills.saleCount + bills.purchaseCount + bills.repairCount : "—", "bills"],
          [inv ? inv.skus : "—", "stock SKUs"],
          [bills ? money(bills.saleToday) : "₹0", "sales today"],
        ].map(([n, l]) => (
          <div key={String(l)} className="rounded-2xl border border-white/8 bg-white/4 p-5">
            <p className="font-display text-4xl tabular-nums">{n}</p>
            <p className="mt-1 text-sm text-parchment/60">{l}</p>
          </div>
        ))}
      </div>

      <section>
        <p className="text-[10px] tracking-[0.2em] text-bronze uppercase">1 · Customers</p>
        <div className="mt-2 flex items-end justify-between gap-3">
          <h2 className="font-display text-3xl">Online visited customers</h2>
          <Link to="/owner/visitors" className="text-sm text-bronze">
            All
          </Link>
        </div>
        <p className="mt-1 text-sm text-parchment/55">Requirement, place, time, contact, mail ID.</p>
        <VisitTable rows={data.recentVisits} />
      </section>

      <section>
        <p className="text-[10px] tracking-[0.2em] text-bronze uppercase">2 · Bills and invoice</p>
        <h2 className="mt-2 font-display text-3xl">Sales · Purchase · Repair</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <Link to="/owner/bills/sale" className={toolCard}>
            <Receipt className="size-5 text-bronze" />
            <h3 className="mt-3 font-display text-2xl">Sales bill</h3>
            <p className="mt-1 text-sm text-parchment/55">Tax invoice when a piece leaves.</p>
            <p className="mt-3 text-xs text-bronze">{bills ? `${bills.saleCount} · today ${money(bills.saleToday)}` : "Write one"}</p>
          </Link>
          <Link to="/owner/bills/purchase" className={toolCard}>
            <FileInput className="size-5 text-bronze" />
            <h3 className="mt-3 font-display text-2xl">Purchase bill</h3>
            <p className="mt-1 text-sm text-parchment/55">Stock in from the supplier.</p>
            <p className="mt-3 text-xs text-bronze">{bills ? `${bills.purchaseCount} bills` : "Enter their invoice"}</p>
          </Link>
          <Link to="/owner/bills/repair" className={toolCard}>
            <Sparkles className="size-5 text-bronze" />
            <h3 className="mt-3 font-display text-2xl">Repair and polish</h3>
            <p className="mt-1 text-sm text-parchment/55">Polish, sizing, a broken claw.</p>
            <p className="mt-3 text-xs text-bronze">{bills ? `${bills.repairCount} jobs` : "New job bill"}</p>
          </Link>
        </div>
      </section>

      <section>
        <p className="text-[10px] tracking-[0.2em] text-bronze uppercase">3 · Stock</p>
        <h2 className="mt-2 font-display text-3xl">Stock entry · categorywise</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Link to="/owner/bills/stock" className={toolCard}>
            <PackagePlus className="size-5 text-bronze" />
            <h3 className="mt-3 font-display text-2xl">Stock entry bill</h3>
            <p className="mt-1 text-sm text-parchment/55">A piece into a category without a supplier bill.</p>
            <p className="mt-3 text-xs text-bronze">{bills ? `${bills.stockCount} entries` : "New entry"}</p>
          </Link>
          <Link to="/owner/inventory/stock" className={toolCard}>
            <BookOpen className="size-5 text-bronze" />
            <h3 className="mt-3 font-display text-2xl">By category</h3>
            <p className="mt-1 text-sm text-parchment/55">Gemstones, mala, brass, copper — each tray.</p>
            <p className="mt-3 text-xs text-bronze">{inv ? `${inv.skus} SKUs · ${inv.pieces} pcs` : "Open the book"}</p>
          </Link>
        </div>
        {inv?.byCategory?.length ? (
          <ul className="mt-4 divide-y divide-white/8 overflow-hidden rounded-2xl border border-white/8">
            {inv.byCategory.map((c) => (
              <li key={c.category} className="flex items-center justify-between px-4 py-3 text-sm">
                <span>{c.category}</span>
                <span className="text-bronze">
                  {c.pieces} pcs · {invMoney(c.retailValue)}
                </span>
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      <section>
        <p className="text-[10px] tracking-[0.2em] text-bronze uppercase">4 · Barcoding</p>
        <h2 className="mt-2 font-display text-3xl">Scan print</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Link to="/owner/print" className={toolCard}>
            <Printer className="size-5 text-bronze" />
            <h3 className="mt-3 font-display text-2xl">Scan print</h3>
            <p className="mt-1 text-sm text-parchment/55">USB gun or camera. Print the pouch or the A4 bill.</p>
            <p className="mt-3 text-xs text-bronze">Code 128 · SGJ-0001</p>
          </Link>
          <Link to="/owner/inventory/scan" className={toolCard}>
            <Barcode className="size-5 text-bronze" />
            <h3 className="mt-3 font-display text-2xl">Barcode lookup</h3>
            <p className="mt-1 text-sm text-parchment/55">Type or scan a SKU to open the piece.</p>
            <p className="mt-3 text-xs text-bronze">Cabinet count on the pouch</p>
          </Link>
        </div>
      </section>
    </div>
  );
}

function CounterPane({ bills }: { bills: BillSummary | null }) {
  return (
    <div className="mt-6">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-[10px] tracking-[0.2em] text-bronze uppercase">2 · Bills and invoice</p>
          <h2 className="font-display text-3xl font-semibold">Sales · Purchase · Repair</h2>
        </div>
        <Link to="/owner/bills" className="text-sm text-bronze hover:text-bronze-soft">
          All bills
        </Link>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <Link
          to="/owner/bills/sale"
          className="rounded-2xl border border-white/8 bg-white/4 p-5 transition-colors hover:border-bronze/40"
        >
          <Receipt className="size-5 text-bronze" />
          <h3 className="mt-3 font-display text-2xl">Sale bill</h3>
          <p className="mt-1 text-sm text-parchment/55">Tax invoice from the counter.</p>
          <p className="mt-4 text-sm">{bills ? `${bills.saleCount} bills · ${money(bills.saleTotal)}` : "—"}</p>
          <p className="mt-1 text-xs text-bronze">{bills ? `Today ${money(bills.saleToday)}` : "Open the book"}</p>
        </Link>
        <Link
          to="/owner/bills/purchase"
          className="rounded-2xl border border-white/8 bg-white/4 p-5 transition-colors hover:border-bronze/40"
        >
          <FileInput className="size-5 text-bronze" />
          <h3 className="mt-3 font-display text-2xl">Purchase bill</h3>
          <p className="mt-1 text-sm text-parchment/55">Stock in from the supplier.</p>
          <p className="mt-4 text-sm">
            {bills ? `${bills.purchaseCount} bills · ${money(bills.purchaseTotal)}` : "—"}
          </p>
          <p className="mt-1 text-xs text-bronze">Enter their invoice number</p>
        </Link>
        <Link
          to="/owner/bills/repair"
          className="rounded-2xl border border-white/8 bg-white/4 p-5 transition-colors hover:border-bronze/40"
        >
          <Sparkles className="size-5 text-bronze" />
          <h3 className="mt-3 font-display text-2xl">Repair and polish</h3>
          <p className="mt-1 text-sm text-parchment/55">Polish, sizing, a broken claw.</p>
          <p className="mt-4 text-sm">
            {bills ? `${bills.repairCount} bills · ${money(bills.repairTotal)}` : "—"}
          </p>
          <p className="mt-1 text-xs text-bronze">Service GST usually 18%</p>
        </Link>
      </div>
    </div>
  );
}

function CabinetPane({ inv }: { inv: InventorySummary | null }) {
  return (
    <div className="mt-6">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-[10px] tracking-[0.2em] text-bronze uppercase">3 · Stock</p>
          <h2 className="font-display text-3xl font-semibold">Stock entry · categorywise</h2>
        </div>
        <Link to="/owner/inventory" className="text-sm text-bronze hover:text-bronze-soft">
          All tools
        </Link>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <Link
          to="/owner/inventory/stock"
          className="rounded-2xl border border-white/8 bg-white/4 p-5 transition-colors hover:border-bronze/40"
        >
          <BookOpen className="size-5 text-bronze" />
          <h3 className="mt-3 font-display text-2xl">By category</h3>
          <p className="mt-1 text-sm text-parchment/55">Gemstones, mala, brass, copper — one tray each.</p>
          <p className="mt-4 text-sm">{inv ? `${inv.skus} SKUs · ${inv.pieces} pieces` : "—"}</p>
          <p className="mt-1 text-xs text-bronze">{inv ? `${invMoney(inv.retailValue)} on the shelf` : "Open the book"}</p>
        </Link>
        <Link
          to="/owner/catalog"
          className="rounded-2xl border border-white/8 bg-white/4 p-5 transition-colors hover:border-bronze/40"
        >
          <PackagePlus className="size-5 text-bronze" />
          <h3 className="mt-3 font-display text-2xl">Album catalog</h3>
          <p className="mt-1 text-sm text-parchment/55">Vendor list with photographs, details, category-wise.</p>
          <p className="mt-4 text-xs text-bronze">Upload pieces onto ivory</p>
        </Link>
        <Link
          to="/owner/bills/stock"
          className="rounded-2xl border border-white/8 bg-white/4 p-5 transition-colors hover:border-bronze/40"
        >
          <PackagePlus className="size-5 text-bronze" />
          <h3 className="mt-3 font-display text-2xl">Stock entry bill</h3>
          <p className="mt-1 text-sm text-parchment/55">Write a piece into a category without a purchase bill.</p>
          <p className="mt-4 text-xs text-bronze">Opens the stock entry bill</p>
        </Link>
      </div>
      {inv?.byCategory?.length ? (
        <ul className="mt-4 divide-y divide-white/8 overflow-hidden rounded-2xl border border-white/8">
          {inv.byCategory.map((c) => (
            <li key={c.category} className="flex items-center justify-between px-4 py-3 text-sm">
              <span>{c.category}</span>
              <span className="text-bronze">
                {c.pieces} pcs · {invMoney(c.retailValue)}
              </span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function ShopPane({ data }: { data: Dash }) {
  return (
    <div className="mt-6 space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Link
          to="/owner/slides"
          className="rounded-2xl border border-white/8 bg-white/4 p-5 transition-colors hover:border-bronze/40"
        >
          <Images className="size-5 text-bronze" />
          <h3 className="mt-3 font-display text-2xl">Homepage slides</h3>
          <p className="mt-1 text-sm text-parchment/55">Ad posters and product videos.</p>
          <p className="mt-4 text-xs text-bronze">{data.slides} live on the shop</p>
        </Link>
        <Link
          to="/owner/catalog"
          className="rounded-2xl border border-white/8 bg-white/4 p-5 transition-colors hover:border-bronze/40"
        >
          <Images className="size-5 text-bronze" />
          <h3 className="mt-3 font-display text-2xl">Album catalog</h3>
          <p className="mt-1 text-sm text-parchment/55">Vendor product list — image, details, by category.</p>
          <p className="mt-4 text-xs text-bronze">{data.products} pieces in the book</p>
        </Link>
        <Link
          to="/owner/appearance"
          className="rounded-2xl border border-white/8 bg-white/4 p-5 transition-colors hover:border-bronze/40"
        >
          <Palette className="size-5 text-bronze" />
          <h3 className="mt-3 font-display text-2xl">Website style</h3>
          <p className="mt-1 text-sm text-parchment/55">Fonts, colours, and themes. Save to publish.</p>
          <p className="mt-4 text-xs text-bronze">Heritage is the house look</p>
        </Link>
        <Link
          to="/owner/keys"
          className="rounded-2xl border border-white/8 bg-white/4 p-5 transition-colors hover:border-bronze/40"
        >
          <KeyRound className="size-5 text-bronze" />
          <h3 className="mt-3 font-display text-2xl">API keys</h3>
          <p className="mt-1 text-sm text-parchment/55">Paste or mint. Verify. One service at a time.</p>
          <p className="mt-4 text-xs text-bronze">Razorpay · Google · Vercel · house secrets</p>
        </Link>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2">
        {data.slideList
          .filter((s) => s.kind !== "story")
          .map((s) => (
            <Link key={s.id} to="/owner/slides" className="relative shrink-0">
              <img
                src={s.imagePath}
                alt={s.title}
                loading="lazy"
                decoding="async"
                className={cn(
                  "hero-media rounded-2xl object-cover",
                  s.kind === "poster" ? "h-20 w-36" : "h-24 w-16",
                )}
              />
              <span className="absolute bottom-1 left-1 rounded bg-ink/70 px-1.5 py-0.5 text-[9px] tracking-wide text-bronze uppercase">
                {s.kind}
              </span>
            </Link>
          ))}
        <Link
          to="/owner/slides"
          className="grid h-24 w-20 shrink-0 place-items-center rounded-2xl border border-dashed border-bronze/50 text-bronze"
        >
          +
        </Link>
      </div>
    </div>
  );
}

function PeoplePane({ data }: { data: Dash }) {
  return (
    <div className="mt-6 space-y-6">
      <TeamDesk />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <Link
        to="/owner/visitors"
        className="rounded-2xl border border-white/8 bg-white/4 p-5 transition-colors hover:border-bronze/40"
      >
        <Users className="size-5 text-bronze" />
        <h3 className="mt-3 font-display text-2xl">Online customers</h3>
        <p className="mt-1 text-sm text-parchment/55">Requirement, place, time, contact, mail.</p>
        <p className="mt-4 font-display text-3xl tabular-nums">{data.visits}</p>
      </Link>
      <Link
        to="/owner/leads"
        className="rounded-2xl border border-white/8 bg-white/4 p-5 transition-colors hover:border-bronze/40"
      >
        <Bot className="size-5 text-bronze" />
        <h3 className="mt-3 font-display text-2xl">Sales agent</h3>
        <p className="mt-1 text-sm text-parchment/55">Reach visitors. Remind. Share the website.</p>
      </Link>
      <Link
        to="/owner/ai"
        className="rounded-2xl border border-white/8 bg-white/4 p-5 transition-colors hover:border-bronze/40"
      >
        <BrainCircuit className="size-5 text-bronze" />
        <h3 className="mt-3 font-display text-2xl">Advanced AI</h3>
        <p className="mt-1 text-sm text-parchment/55">Mail, WhatsApp, FB, IG, deploy — one control.</p>
      </Link>
      <Link
        to="/owner/enquiries"
        className="rounded-2xl border border-white/8 bg-white/4 p-5 transition-colors hover:border-bronze/40"
      >
        <MessageSquare className="size-5 text-bronze" />
        <h3 className="mt-3 font-display text-2xl">Enquiries</h3>
        <p className="mt-1 text-sm text-parchment/55">From the website form.</p>
        <p className="mt-4 font-display text-3xl tabular-nums">{data.enquiries}</p>
      </Link>
      <Link
        to="/owner/orders"
        className="rounded-2xl border border-white/8 bg-white/4 p-5 transition-colors hover:border-bronze/40"
      >
        <ShoppingBag className="size-5 text-bronze" />
        <h3 className="mt-3 font-display text-2xl">Orders</h3>
        <p className="mt-1 text-sm text-parchment/55">Hand-written from the counter.</p>
        <p className="mt-4 font-display text-3xl tabular-nums">{data.orders}</p>
      </Link>
      <Link
        to="/owner/visitors"
        className="rounded-2xl border border-white/8 bg-white/4 p-5 transition-colors hover:border-bronze/40"
      >
        <Users className="size-5 text-bronze" />
        <h3 className="mt-3 font-display text-2xl">Visitors</h3>
        <p className="mt-1 text-sm text-parchment/55">Paths on the public shop.</p>
        <p className="mt-4 font-display text-3xl tabular-nums">{data.visits}</p>
      </Link>
      <Link
        to="/owner/reviews"
        className="rounded-2xl border border-white/8 bg-white/4 p-5 transition-colors hover:border-bronze/40"
      >
        <Star className="size-5 text-bronze" />
        <h3 className="mt-3 font-display text-2xl">Reviews</h3>
        <p className="mt-1 text-sm text-parchment/55">What the book already shows.</p>
        <p className="mt-4 font-display text-3xl tabular-nums">{SEED_REVIEWS.length}</p>
      </Link>
      </div>
    </div>
  );
}

function TeamDesk() {
  const { can } = useDeskAccess();
  const [rows, setRows] = useState<{ email: string; name: string; role: DeskRole }[]>([]);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<DeskRole>("counter");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const load = useCallback(() => {
    void listStaff().then(setRows).catch(() => setRows([]));
  }, []);
  useEffect(load, [load]);

  if (!can("team")) return null;

  async function onAdd(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await addStaff({ data: { email, name, role } });
      setEmail("");
      setName("");
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not add that person.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-2xl border border-white/8 bg-white/4 p-5">
      <p className="text-[10px] tracking-[0.2em] text-bronze uppercase">Keys on the ring</p>
      <h2 className="mt-1 font-display text-2xl">Who may open which drawer</h2>
      <p className="mt-1 max-w-xl text-sm text-parchment/55">
        Owner, counter, cabinet, shop front, watcher. Visitors never see this list.
      </p>
      <ul className="mt-5 space-y-2">
        {rows.map((r) => (
          <li
            key={r.email}
            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/8 px-3 py-2 text-sm"
          >
            <span className="min-w-0">
              <span className="text-parchment">{r.email}</span>
              {r.name ? <span className="ml-2 text-parchment/45">{r.name}</span> : null}
            </span>
            <span className="flex items-center gap-2">
              <select
                value={r.role}
                onChange={(e) => {
                  const next = e.target.value as DeskRole;
                  void setStaffRole({ data: { email: r.email, role: next } })
                    .then(load)
                    .catch((err: unknown) =>
                      setError(err instanceof Error ? err.message : "Could not change the key."),
                    );
                }}
                className="h-9 rounded-[10px] border border-white/15 bg-[#08110e] px-2 text-xs"
                aria-label={`Role for ${r.email}`}
              >
                {DESK_ROLES.map((id) => (
                  <option key={id} value={id}>
                    {ROLE_COPY[id].label}
                  </option>
                ))}
              </select>
              <button
                type="button"
                className="text-xs text-parchment/45 hover:text-parchment"
                onClick={() =>
                  void removeStaff({ data: { email: r.email } })
                    .then(load)
                    .catch((err: unknown) =>
                      setError(err instanceof Error ? err.message : "Could not remove."),
                    )
                }
              >
                Remove
              </button>
            </span>
          </li>
        ))}
      </ul>
      {error ? <p className="mt-3 text-sm text-red-300">{error}</p> : null}
      <form onSubmit={(e) => void onAdd(e)} className="mt-4 flex flex-wrap gap-2">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="team@email"
          className="h-10 min-w-[12rem] flex-1 rounded-[10px] border border-white/15 bg-white/5 px-3 text-sm"
        />
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name"
          className="h-10 w-32 rounded-[10px] border border-white/15 bg-white/5 px-3 text-sm"
        />
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as DeskRole)}
          className="h-10 rounded-[10px] border border-white/15 bg-[#08110e] px-2 text-sm"
        >
          {DESK_ROLES.map((id) => (
            <option key={id} value={id}>
              {ROLE_COPY[id].label}
            </option>
          ))}
        </select>
        <button
          type="submit"
          disabled={busy}
          className={cn(buttonVariants({ size: "sm" }), "bg-bronze text-ink hover:bg-bronze-soft")}
        >
          {busy ? "Saving…" : "Add to desk"}
        </button>
      </form>
      <dl className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {DESK_ROLES.map((id) => (
          <div key={id}>
            <dt className="text-xs font-medium text-bronze">{ROLE_COPY[id].label}</dt>
            <dd className="mt-1 text-[11px] leading-relaxed text-parchment/50">{ROLE_COPY[id].ring}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function Quick({
  to,
  icon: Icon,
  title,
  note,
}: {
  to: "/owner/bills/sale" | "/owner/inventory/scan" | "/owner/orders" | "/owner/enquiries";
  icon: typeof Receipt;
  title: string;
  note: string;
}) {
  return (
    <Link
      to={to}
      className="rounded-2xl border border-white/8 bg-white/4 p-5 transition-colors hover:border-bronze/40"
    >
      <Icon className="size-5 text-bronze" />
      <h3 className="mt-3 font-medium">{title}</h3>
      <p className="mt-1 text-xs text-parchment/55">{note}</p>
    </Link>
  );
}
