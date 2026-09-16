import { createFileRoute, Link, Navigate, Outlet, useRouterState } from "@tanstack/react-router";
import { useState } from "react";
import {
  LayoutDashboard,
  Package,
  Images,
  BookImage,
  MessageSquare,
  ShoppingBag,
  Users,
  Star,
  Share2,
  Menu,
  X,
  ExternalLink,
  Receipt,
  Warehouse,
  Megaphone,
  Sparkles,
  Percent,
  Tags,
  Truck,
  LineChart,
  Settings,
  Fingerprint,
  ScanLine,
  IdCard,
  BookOpen,
  Trophy,
  CreditCard,
  Globe,
} from "lucide-react";
import { RedirectToSignIn, UserButton } from "@/lib/auth/gates";
import { useDeskAccess } from "@/lib/use-staff";
import { capForPath, ROLE_COPY, type DeskCap } from "@/lib/rbac";
import { BrandMark } from "@/components/logo";
import { cn } from "@/lib/utils";
import { TouchLockGate, BillsTouchGate } from "@/components/touch-id";

export const Route = createFileRoute("/owner")({
  component: OwnerLayout,
  head: () => ({
    meta: [{ name: "robots", content: "noindex,nofollow" }],
  }),
});

type DeskLink = {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  cap: DeskCap;
  children?: { to: string; label: string }[];
};

const MAIN: DeskLink[] = [
  { to: "/owner", label: "Dashboard", icon: LayoutDashboard, cap: "desk" },
  { to: "/owner/ads", label: "Analytics", icon: Megaphone, cap: "appearance" },
  { to: "/owner/products", label: "Products", icon: Package, cap: "products" },
  { to: "/owner/catalog", label: "Album catalog", icon: BookImage, cap: "products" },
  { to: "/owner/slides", label: "Slides", icon: Images, cap: "slides" },
  { to: "/owner/social", label: "Social post", icon: Share2, cap: "social" },
  { to: "/owner/enquiries", label: "Enquiries", icon: MessageSquare, cap: "enquiries" },
  { to: "/owner/orders", label: "Orders", icon: ShoppingBag, cap: "orders" },
  { to: "/owner/reviews", label: "Reviews", icon: Star, cap: "reviews" },
  { to: "/owner/visitors", label: "Online customers", icon: Users, cap: "visitors" },
  { to: "/owner/astrology", label: "Astrology", icon: Sparkles, cap: "slides" },
  { to: "/owner/discounts", label: "Discounted zone", icon: Percent, cap: "products" },
  { to: "/owner/categories", label: "Categories", icon: Tags, cap: "products" },
  { to: "/owner/vendors", label: "Vendors", icon: Truck, cap: "inventory" },
  { to: "/owner/performance", label: "Performance", icon: LineChart, cap: "visitors" },
  { to: "/owner/selling", label: "Most sold", icon: Trophy, cap: "bills" },
  { to: "/owner/users", label: "Staff login IDs", icon: IdCard, cap: "team" },
  { to: "/owner/security", label: "Biometric", icon: Fingerprint, cap: "desk" },
  { to: "/owner/settings", label: "Settings", icon: Settings, cap: "appearance" },
];

const COUNTER: DeskLink[] = [
  { to: "/owner/print", label: "Print & scan", icon: ScanLine, cap: "inventory" },
  {
    to: "/owner/bills",
    label: "Bills & invoices",
    icon: Receipt,
    cap: "bills",
    children: [
      { to: "/owner/bills/sale", label: "Sales bill" },
      { to: "/owner/bills/stock", label: "Stock entry bill" },
      { to: "/owner/bills/purchase", label: "Purchase bill" },
      { to: "/owner/bills/repair", label: "Repair & polished" },
      { to: "/owner/bills/returns", label: "Return & cancellation" },
      { to: "/owner/bills/expenses", label: "Daily expenses" },
    ],
  },
  { to: "/owner/gst", label: "GST rate chart", icon: BookOpen, cap: "bills" },
  { to: "/owner/payments", label: "Razorpay", icon: CreditCard, cap: "appearance" },
  { to: "/owner/live", label: "Live website", icon: Globe, cap: "appearance" },
  {
    to: "/owner/inventory",
    label: "Inventory",
    icon: Warehouse,
    cap: "inventory",
    children: [
      { to: "/owner/inventory/stock", label: "Stock book" },
      { to: "/owner/inventory/scan", label: "Barcode" },
      { to: "/owner/inventory/labels", label: "Labels" },
      { to: "/owner/inventory/ledger", label: "In & out" },
      { to: "/owner/inventory/alerts", label: "Low stock" },
    ],
  },
];

function NavBlock({
  items,
  pathname,
  can,
  onClose,
}: {
  items: DeskLink[];
  pathname: string;
  can: (cap: DeskCap) => boolean;
  onClose: () => void;
}) {
  return (
    <>
      {items
        .filter((item) => can(item.cap))
        .map((item) => {
          const kids = item.children;
          const active =
            item.to === "/owner"
              ? pathname === "/owner" || pathname === "/owner/"
              : pathname === item.to || pathname.startsWith(`${item.to}/`);
          return (
            <div key={item.to}>
              <Link
                to={item.to}
                onClick={onClose}
                className={cn(
                  "flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm",
                  active ? "bg-ink text-ivory" : "text-ink-muted hover:bg-ink/5",
                )}
              >
                <item.icon className="size-4 shrink-0" />
                {item.label}
              </Link>
              {kids ? (
                <div className="mb-1 ml-4 mt-0.5 flex flex-col border-l border-ink/10 pl-2">
                  {kids.map((child) => {
                    const on = pathname === child.to || pathname.startsWith(`${child.to}/`);
                    return (
                      <Link
                        key={child.to}
                        to={child.to}
                        onClick={onClose}
                        className={cn(
                          "flex min-h-10 items-center rounded-lg px-3 text-[13px]",
                          on ? "text-garnet" : "text-ink-muted hover:text-ink",
                        )}
                      >
                        {child.label}
                      </Link>
                    );
                  })}
                </div>
              ) : null}
            </div>
          );
        })}
    </>
  );
}

function OwnerLayout() {
  const { user, isPending, staff, role, can } = useDeskAccess();
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  if (isPending) {
    return (
      <div className="grid min-h-dvh place-items-center bg-ivory text-ink">
        <p className="text-sm text-bronze">Opening the owner panel…</p>
      </div>
    );
  }
  if (!user) return <RedirectToSignIn to="/admin" />;
  if (!staff) return <Navigate to="/account" />;

  const ringOk = can(capForPath(pathname));
  const desk = (
    <div className="sgj-desk flex min-h-dvh bg-ivory text-ink">
      <aside
        className={cn(
          "print-hidden fixed inset-y-0 left-0 z-40 flex w-64 flex-col overflow-y-auto border-r border-ink/10 bg-[#eef4ea] p-4 transition-transform md:static md:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between gap-2">
          <Link to="/owner" onClick={() => setOpen(false)} className="flex min-w-0 items-center gap-2.5">
            <BrandMark className="size-9 shrink-0 rounded-[10px]" />
            <span className="min-w-0">
              <span className="block text-[11px] font-semibold tracking-[0.14em] text-ink">
                SGJ ADMIN
              </span>
              <span className="block text-[9px] tracking-[0.16em] text-garnet uppercase">
                Business owner panel
              </span>
            </span>
          </Link>
          <button type="button" className="md:hidden" onClick={() => setOpen(false)} aria-label="Close">
            <X className="size-5" />
          </button>
        </div>
        <nav className="mt-6 flex flex-1 flex-col gap-0.5">
          <NavBlock items={MAIN} pathname={pathname} can={can} onClose={() => setOpen(false)} />
          {COUNTER.some((i) => can(i.cap)) ? (
            <p className="mt-5 mb-1 px-3 text-[9px] tracking-[0.2em] text-garnet/80 uppercase">Counter</p>
          ) : null}
          <NavBlock items={COUNTER} pathname={pathname} can={can} onClose={() => setOpen(false)} />
        </nav>
        <Link
          to="/"
          className="mt-6 flex items-center gap-2 px-3 text-sm text-garnet hover:text-garnet-deep"
        >
          <ExternalLink className="size-4" />
          View website
        </Link>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="owner-topbar print-hidden flex h-14 items-center justify-between gap-3 border-b border-ink/10 px-4">
          <button
            type="button"
            className="md:hidden"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="size-5" />
          </button>
          <p className="hidden truncate text-xs text-ink-muted sm:block">
            {user.displayName ?? user.primaryEmail}
            {role ? ` · ${ROLE_COPY[role].label}` : ""}
          </p>
          <UserButton />
        </header>
        <div className="flex-1 overflow-auto p-4 sm:p-6 print:overflow-visible print:p-0">
          {ringOk ? (
            pathname.startsWith("/owner/bills") ? (
              <BillsTouchGate>
                <Outlet />
              </BillsTouchGate>
            ) : (
              <Outlet />
            )
          ) : (
            <div className="mx-auto max-w-lg py-16 text-center">
              <p className="text-[10px] tracking-[0.2em] text-bronze uppercase">Not on your ring</p>
              <h1 className="mt-3 font-display text-3xl">This key stays with another hand.</h1>
              <p className="mt-3 text-sm text-ink-muted">
                {role ? ROLE_COPY[role].ring : "Your account cannot open this drawer."}
              </p>
              <Link to="/owner" className="mt-6 inline-block text-sm text-bronze hover:text-bronze-soft">
                Back to the desk
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <TouchLockGate email={user.primaryEmail ?? ""}>
      {desk}
    </TouchLockGate>
  );
}
