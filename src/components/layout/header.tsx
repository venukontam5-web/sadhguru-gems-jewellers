import { useRef, useState, type ReactNode } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Menu, X, Phone, User, ShoppingBag } from "lucide-react";
import { Wordmark } from "@/components/logo";
import { buttonVariants } from "@/components/ui/button";
import { SITE, NAV, FOOTER_COMPANY, whatsappHref } from "@/data/site";
import { cn } from "@/lib/utils";
import { SignedIn, SignedOut, UserButton } from "@/lib/auth/gates";
import { useIsStaff } from "@/lib/use-staff";
import { VisitBeacon } from "@/components/visit-beacon";
import { useCartOptional } from "@/lib/cart-store";

const DESKTOP = NAV.filter((n) =>
  ["Shop", "Gemstones", "Navratna", "Colours", "Astrology", "About", "Contact"].includes(n.label),
);

function HouseLogo({ onNavigate }: { onNavigate?: () => void }) {
  const navigate = useNavigate();
  const taps = useRef<number[]>([]);

  return (
    <Link
      to="/"
      aria-label={SITE.name}
      onClick={(e) => {
        const now = Date.now();
        taps.current = taps.current.filter((t) => now - t < 2500);
        taps.current.push(now);
        if (taps.current.length >= 5) {
          e.preventDefault();
          taps.current = [];
          onNavigate?.();
          void navigate({ to: "/admin" });
          return;
        }
        onNavigate?.();
      }}
    >
      <Wordmark />
    </Link>
  );
}

function CartSlot() {
  const cart = useCartOptional();
  const n = cart?.count ?? 0;
  return (
    <Link
      to="/cart"
      className={cn(buttonVariants({ variant: "outline", size: "sm" }), "relative px-3")}
      aria-label={n ? `Cart, ${n} pieces` : "Cart"}
    >
      <ShoppingBag className="size-4" />
      <span className="hidden sm:inline">Cart</span>
      {n > 0 ? (
        <span className="absolute -top-1 -right-1 grid min-w-4 place-items-center rounded-full bg-garnet px-1 text-[10px] text-ivory">
          {n}
        </span>
      ) : null}
    </Link>
  );
}

function AuthSlot() {
  const { user, isPending, staff } = useIsStaff();
  if (isPending) return <div className="h-10 w-28 animate-pulse rounded-[10px] bg-ink/10" />;
  if (!user) {
    return (
      <Link
        to="/login"
        className={cn(buttonVariants({ variant: "outline", size: "sm" }), "px-3 sm:px-4")}
      >
        <User className="size-4" />
        <span>Sign in</span>
      </Link>
    );
  }
  return (
    <div className="flex items-center gap-2 sm:gap-3">
      {staff ? (
        <Link to="/account" className={cn(buttonVariants({ variant: "gold", size: "sm" }))}>
          Dashboard
        </Link>
      ) : (
        <Link to="/account" className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
          Account
        </Link>
      )}
      <span className="hidden sm:inline-flex">
        <UserButton />
      </span>
    </div>
  );
}

function StaffOrAccount({ onClose }: { onClose: () => void }) {
  const { staff } = useIsStaff();
  return (
    <Link
      to="/account"
      onClick={onClose}
      className={cn(buttonVariants({ variant: staff ? "gold" : "outline", size: "md" }), "mt-2")}
    >
      {staff ? "Dashboard" : "Your account"}
    </Link>
  );
}

export function Header() {
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <header className="sticky top-0 z-40">
      <div className="bg-ink text-parchment">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-2 text-[11px] tracking-wide sm:px-6">
          <p className="truncate text-bronze-soft">
            {SITE.address.locality} · {SITE.hours} · {SITE.hoursNote}
          </p>
          <a
            href={SITE.phoneHref}
            className="hidden items-center gap-1.5 text-parchment hover:text-bronze-soft sm:inline-flex"
          >
            <Phone className="size-3" />
            {SITE.phone}
          </a>
        </div>
      </div>
      <div className="border-b border-ink/8 bg-parchment/90 backdrop-blur-md">
        <div className="mx-auto flex h-[76px] max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <HouseLogo onNavigate={() => setOpen(false)} />
          <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
            {DESKTOP.map((item) => {
              const active = pathname === item.to || pathname.startsWith(`${item.to}/`);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "rounded-[10px] px-3 py-2 text-[13px] font-medium transition-colors duration-150",
                    active ? "bg-ink/6 text-ink" : "text-ink-muted hover:text-ink",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="flex items-center gap-2">
            <CartSlot />
            <AuthSlot />
            <a
              href={whatsappHref()}
              className={cn(buttonVariants({ variant: "primary", size: "sm" }), "hidden sm:inline-flex")}
            >
              WhatsApp
            </a>
            <button
              type="button"
              className="inline-flex size-11 items-center justify-center rounded-[12px] text-ink lg:hidden"
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>
        {open ? (
          <div className="border-t border-ink/8 bg-parchment px-4 py-4 lg:hidden">
            <nav className="flex flex-col gap-1" aria-label="Mobile">
              {NAV.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className="flex min-h-11 items-center rounded-[12px] px-3 text-[15px] font-medium text-ink"
                >
                  {item.label}
                </Link>
              ))}
              <Link
                to="/cart"
                onClick={() => setOpen(false)}
                className="flex min-h-11 items-center rounded-[12px] px-3 text-[15px] font-medium text-ink"
              >
                Cart
              </Link>
              <SignedOut>
                <Link
                  to="/login"
                  onClick={() => setOpen(false)}
                  className={cn(buttonVariants({ variant: "outline", size: "md" }), "mt-2")}
                >
                  Sign in
                </Link>
              </SignedOut>
              <SignedIn>
                <StaffOrAccount onClose={() => setOpen(false)} />
              </SignedIn>
              <a
                href={SITE.youtube}
                className="flex min-h-11 items-center rounded-[12px] px-3 text-[15px] font-medium text-ink"
              >
                Shorts
              </a>
              <a
                href={whatsappHref()}
                className={cn(buttonVariants({ variant: "primary", size: "md" }), "mt-2")}
              >
                WhatsApp enquire
              </a>
            </nav>
          </div>
        ) : null}
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="mt-auto bg-ink text-parchment">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 md:grid-cols-4">
        <div className="md:col-span-1">
          <Wordmark className="h-14 max-w-[220px] sm:h-16 sm:max-w-[250px]" />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-bronze-soft">
            Certified gemstones, gold, brass and copper from Akkalkot Road.
          </p>
          <p className="mt-4 text-xs tracking-[0.18em] text-stone uppercase">
            <Link to="/admin" className="inline-flex min-h-11 items-center hover:text-bronze-soft">
              Est. {SITE.established} · Solapur
            </Link>
          </p>
        </div>
        <div>
          <h2 className="font-sans text-xs font-medium tracking-[0.18em] text-bronze uppercase">
            Collections
          </h2>
          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <Link to="/shop" className="text-parchment/80 hover:text-parchment">
                Shop
              </Link>
            </li>
            <li>
              <Link to="/gemstones" className="text-parchment/80 hover:text-parchment">
                Gemstones
              </Link>
            </li>
            <li>
              <Link to="/navratna" className="text-parchment/80 hover:text-parchment">
                Navratna benefits
              </Link>
            </li>
            <li>
              <Link to="/colours" className="text-parchment/80 hover:text-parchment">
                Colour psychology
              </Link>
            </li>
            <li>
              <Link to="/brass" className="text-parchment/80 hover:text-parchment">
                Brass items
              </Link>
            </li>
            <li>
              <Link to="/copper" className="text-parchment/80 hover:text-parchment">
                Copper ware
              </Link>
            </li>
            <li>
              <Link to="/astrology" className="text-parchment/80 hover:text-parchment">
                Astrology
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h2 className="font-sans text-xs font-medium tracking-[0.18em] text-bronze uppercase">
            The house
          </h2>
          <ul className="mt-4 space-y-2 text-sm">
            {FOOTER_COMPANY.map((item) => (
              <li key={item.to}>
                <Link to={item.to} className="text-parchment/80 hover:text-parchment">
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <Link to="/shipping" className="text-parchment/80 hover:text-parchment">
                Shipping
              </Link>
            </li>
            <li>
              <Link to="/track" className="text-parchment/80 hover:text-parchment">
                Track order
              </Link>
            </li>
            <li>
              <Link to="/privacy" className="text-parchment/80 hover:text-parchment">
                Privacy
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h2 className="font-sans text-xs font-medium tracking-[0.18em] text-bronze uppercase">
            Visit
          </h2>
          <address className="mt-4 not-italic text-sm leading-relaxed text-parchment/80">
            {SITE.address.line1}
            <br />
            {SITE.address.line2}
            <br />
            {SITE.address.locality}, {SITE.address.region} {SITE.address.postalCode}
          </address>
          <p className="mt-3 text-sm">
            <a href={SITE.phoneHref} className="hover:text-bronze-soft">
              {SITE.phone}
            </a>
            <br />
            <a href={SITE.emailHref} className="hover:text-bronze-soft">
              {SITE.email}
            </a>
          </p>
          <p className="mt-3 text-xs text-stone">
            {SITE.hours} · {SITE.hoursNote}
          </p>
        </div>
      </div>
      <div className="border-t border-white/8">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-5 text-xs text-stone sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>
            © {new Date().getFullYear()} {SITE.legalName}. {SITE.domain}
            {" · "}
            <Link to="/admin" className="inline-flex min-h-11 items-center hover:text-bronze-soft">
              Est. {SITE.established}
            </Link>
          </p>
          <p>Certified gemstones · Gold · Silver · Brass · Copper</p>
        </div>
      </div>
    </footer>
  );
}

export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-parchment text-ink">
      <VisitBeacon />
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <a
        href={whatsappHref()}
        className="fixed right-4 bottom-4 z-30 inline-flex size-14 items-center justify-center rounded-full bg-garnet text-ivory shadow-lg sm:right-6 sm:bottom-6"
        aria-label="Chat on WhatsApp"
      >
        <svg viewBox="0 0 24 24" className="size-6 fill-current" aria-hidden>
          <path d="M19.05 4.91A9.82 9.82 0 0 0 12.04 2C6.55 2 2.08 6.46 2.08 11.96c0 1.76.46 3.47 1.34 4.99L2 22l5.21-1.37a9.93 9.93 0 0 0 4.83 1.23h.01c5.49 0 9.96-4.46 9.96-9.96 0-2.66-1.04-5.16-2.96-7zM12.04 20.15h-.01a8.25 8.25 0 0 1-4.21-1.15l-.3-.18-3.09.81.83-3.01-.2-.31a8.2 8.2 0 0 1-1.26-4.38c0-4.54 3.7-8.23 8.25-8.23 2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 0 1 2.42 5.82c0 4.55-3.7 8.24-8.25 8.24zm4.52-6.17c-.25-.12-1.47-.72-1.7-.81-.23-.08-.39-.12-.56.13-.16.24-.64.8-.79.97-.14.16-.3.18-.55.06-.25-.12-1.05-.39-2-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.24-.02-.38.11-.5.11-.11.25-.3.37-.44.12-.15.16-.25.25-.42.08-.16.04-.31-.02-.44-.06-.12-.56-1.34-.76-1.84-.2-.48-.4-.42-.56-.42h-.48c-.16 0-.43.06-.65.31-.22.24-.86.84-.86 2.05s.88 2.38 1 2.54c.12.16 1.73 2.64 4.2 3.7.59.25 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.68-1.18.2-.58.2-1.08.14-1.18-.06-.1-.23-.16-.48-.28z" />
        </svg>
      </a>
    </div>
  );
}
