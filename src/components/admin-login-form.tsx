import { useState, type FormEvent } from "react";
import { GROK_PROVIDERS, authClient, signIn } from "@/lib/auth/client";
import { UserButton } from "@/lib/auth/gates";
import { Link } from "@tanstack/react-router";
import { buttonVariants } from "@/components/ui/button";
import { isStaffEmail } from "@/data/staff";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { cn } from "@/lib/utils";
import { TouchRegisterCard, TouchUnlockButton } from "@/components/touch-id";
import { markDeskUnlocked } from "@/lib/touch-id";
import { resolveStaffDoor } from "@/server/staff";
import { useIsStaff } from "@/lib/use-staff";

export function AdminLoginForm() {
  const { user } = useCurrentUserState();
  const { staff, isPending } = useIsStaff();

  if (staff) return <StaffAlreadyIn />;
  if (user && !isPending && !staff) {
    return (
      <div className="rounded-[16px] border border-white/10 p-4">
        <p className="text-xs tracking-wider text-bronze uppercase">Customer session</p>
        <p className="mt-2 text-sm text-parchment/70">
          This sign-in is a shop account. Sign out, then open Admin login with the house email.
        </p>
        <div className="mt-4">
          <UserButton />
        </div>
      </div>
    );
  }
  return <FormBody />;
}

function StaffAlreadyIn() {
  const { user } = useCurrentUserState();
  return (
    <div className="rounded-[16px] border border-white/10 p-4">
      <p className="text-xs tracking-wider text-bronze uppercase">Already signed in</p>
      <div className="mt-3">
        <UserButton />
      </div>
      {user?.primaryEmail ? (
        <div className="mt-4">
          <TouchRegisterCard email={user.primaryEmail} name={user.displayName ?? undefined} dark />
        </div>
      ) : null}
      <Link
        to="/owner"
        onClick={() => markDeskUnlocked()}
        className={cn(buttonVariants(), "mt-4 w-full bg-bronze text-ink hover:bg-bronze-soft")}
      >
        Open dashboard
      </Link>
    </div>
  );
}

function FormBody() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [mode, setMode] = useState<"in" | "up">("in");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const door = await resolveStaffDoor({ data: { key: email } });
      if (!door.ok || !door.email) {
        setError("This door is for the house. Use the staff login ID or house email.");
        return;
      }
      const houseEmail = door.email;
      if (mode === "up") {
        if (!houseEmail.includes("@") || !isStaffEmail(houseEmail)) {
          setError("Create a house account with the house email first.");
          return;
        }
        const res = await authClient.signUp.email({
          email: houseEmail,
          password,
          name: name.trim() || "Owner",
        });
        if (res.error) {
          setError(res.error.message || "Could not create the house account.");
          return;
        }
      } else {
        const res = await authClient.signIn.email({ email: houseEmail, password });
        if (res.error) {
          setError(res.error.message || "Email or password is not right.");
          return;
        }
      }
      markDeskUnlocked();
      window.location.assign("/owner");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign-in failed.");
    } finally {
      setBusy(false);
    }
  }

  const field =
    "mt-1 h-11 w-full rounded-[12px] border border-white/15 bg-white/5 px-3.5 text-sm text-parchment outline-none focus:border-bronze";

  return (
    <div>
      <TouchUnlockButton
        dark
        className="mb-6"
        onUnlocked={() => {
          window.location.assign("/owner");
        }}
      />
      <form onSubmit={(e) => void onSubmit(e)} className="space-y-3">
        {mode === "up" ? (
          <label className="block text-xs text-parchment/70">
            Name
            <input className={field} value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
          </label>
        ) : null}
        <label className="block text-xs text-parchment/70">
          Email or staff login ID
          <input
            className={field}
            type="text"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="username"
            placeholder="SGJ-01 or house email"
          />
        </label>
        <label className="block text-xs text-parchment/70">
          Password
          <input
            className={field}
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={mode === "up" ? "new-password" : "current-password"}
          />
        </label>
        {error ? <p className="text-sm text-red-300">{error}</p> : null}
        <button
          type="submit"
          disabled={busy}
          className={cn(buttonVariants(), "w-full bg-bronze text-ink hover:bg-bronze-soft")}
        >
          {busy ? "Please wait…" : mode === "up" ? "Create house account" : "Open the desk"}
        </button>
      </form>
      <button
        type="button"
        className="mt-3 w-full text-sm text-parchment/60 hover:text-parchment"
        onClick={() => {
          setMode(mode === "in" ? "up" : "in");
          setError(null);
        }}
      >
        {mode === "in" ? "First time at the desk? Create a house account" : "Already on the team? Sign in"}
      </button>
      <p className="mt-4 text-xs leading-relaxed text-parchment/45">
        Hidden behind Est. 2016. Visitors see Sign in — this form is the house door.
      </p>
      <div className="mt-8 flex items-center gap-3 text-[11px] tracking-wide text-parchment/40 uppercase">
        <span className="h-px flex-1 bg-white/10" />
        or
        <span className="h-px flex-1 bg-white/10" />
      </div>
      <div className="mt-4 space-y-3">
        {GROK_PROVIDERS.map((p) => (
          <button
            key={p.providerId}
            type="button"
            onClick={() => signIn(p.providerId, { callbackURL: "/owner" })}
            className="w-full cursor-pointer rounded-[12px] border border-white/15 bg-white/5 px-4 py-3 text-sm hover:bg-white/10"
          >
            Continue with {p.label}
          </button>
        ))}
      </div>
    </div>
  );
}