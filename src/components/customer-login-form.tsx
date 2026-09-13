import { useState, type FormEvent } from "react";
import { Link } from "@tanstack/react-router";
import { GROK_PROVIDERS, authClient, signIn } from "@/lib/auth/client";
import { SignInGate, UserButton } from "@/lib/auth/gates";
import { buttonVariants } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { isStaffUser } from "@/data/staff";
import { useCurrentUser } from "@/lib/auth/use-current-user";
import { cn } from "@/lib/utils";
import { TouchUnlockButton } from "@/components/touch-id";
import { markDeskUnlocked } from "@/lib/touch-id";

function afterPath() {
  return "/account";
}

export function CustomerLoginForm() {
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
      if (mode === "up") {
        const res = await authClient.signUp.email({
          email,
          password,
          name: name.trim() || "Guest",
        });
        if (res.error) {
          setError(res.error.message || "Could not create the account.");
          return;
        }
      } else {
        const res = await authClient.signIn.email({ email, password });
        if (res.error) {
          setError(res.error.message || "Email or password is not right.");
          return;
        }
      }
      markDeskUnlocked();
      window.location.assign(afterPath());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign-in failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <SignInGate fallback={<FormBody />}>
      <SignedInNext />
    </SignInGate>
  );

  function FormBody() {
    return (
      <div>
        <TouchUnlockButton
          className="mb-6"
          onUnlocked={(rec) => {
            window.location.assign(afterPath());
          }}
        />
        <form onSubmit={(e) => void onSubmit(e)} className="space-y-4">
          {mode === "up" ? (
            <div>
              <Label htmlFor="cust-name">Name</Label>
              <Input
                id="cust-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
              />
            </div>
          ) : null}
          <div>
            <Label htmlFor="cust-email">Email</Label>
            <Input
              id="cust-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
            />
          </div>
          <div>
            <Label htmlFor="cust-password">Password</Label>
            <Input
              id="cust-password"
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={mode === "up" ? "new-password" : "current-password"}
            />
          </div>
          {error ? <p className="text-sm text-garnet">{error}</p> : null}
          <button type="submit" disabled={busy} className={cn(buttonVariants(), "w-full")}>
            {busy ? "Please wait…" : mode === "up" ? "Create account" : "Sign in"}
          </button>
        </form>
        <button
          type="button"
          className="mt-4 w-full text-sm text-ink-muted hover:text-ink"
          onClick={() => {
            setMode(mode === "in" ? "up" : "in");
            setError(null);
          }}
        >
          {mode === "in" ? "New here? Create an account" : "Already have an account? Sign in"}
        </button>
        <div className="mt-8 flex items-center gap-3 text-[11px] tracking-wide text-stone uppercase">
          <span className="h-px flex-1 bg-line" />
          or
          <span className="h-px flex-1 bg-line" />
        </div>
        <div className="mt-4 space-y-3">
          {GROK_PROVIDERS.map((p) => (
            <button
              key={p.providerId}
              type="button"
              onClick={() => signIn(p.providerId, { callbackURL: "/account" })}
              className="w-full cursor-pointer rounded-[12px] border border-ink/12 bg-ivory px-4 py-3 text-sm hover:bg-parchment"
            >
              Continue with {p.label}
            </button>
          ))}
        </div>
      </div>
    );
  }
}

function SignedInNext() {
  const user = useCurrentUser();
  const staff = isStaffUser(user);
  return (
    <div className="rounded-[16px] border border-line bg-parchment p-5">
      <p className="text-xs tracking-[0.18em] text-garnet uppercase">Signed in</p>
      <div className="mt-3">
        <UserButton />
      </div>
      <Link
        to={staff ? "/owner" : "/account"}
        className={cn(buttonVariants(), "mt-4 w-full")}
      >
        {staff ? "Open the desk" : "Go to your account"}
      </Link>
    </div>
  );
}
