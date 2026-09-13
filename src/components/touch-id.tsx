import { useEffect, useState, type ReactNode } from "react";
import { Fingerprint } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  deskUnlocked,
  forgetTouchId,
  lockDesk,
  readPolicy,
  readTouchRecord,
  registerTouchId,
  touchIdAvailable,
  touchIdHostOk,
  unlockWithTouchId,
  writePolicy,
  billsUnlocked,
  markBillsUnlocked,
  LOCK_MODE_COPY,
  type BiometricPolicy,
  type IdleMinutes,
  type LockMode,
  type TouchRecord,
} from "@/lib/touch-id";

export function useTouchId() {
  const [ready, setReady] = useState(false);
  const [available, setAvailable] = useState(false);
  const [record, setRecord] = useState<TouchRecord | null>(null);
  const [unlocked, setUnlocked] = useState(false);
  const [policy, setPolicy] = useState<BiometricPolicy>(readPolicy);

  useEffect(() => {
    let live = true;
    void touchIdAvailable().then((ok) => {
      if (!live) return;
      setAvailable(ok);
      setRecord(readTouchRecord());
      setUnlocked(deskUnlocked());
      setPolicy(readPolicy());
      setReady(true);
    });
    return () => {
      live = false;
    };
  }, []);

  return { ready, available, record, unlocked, policy, setRecord, setUnlocked, setPolicy };
}

export function TouchUnlockButton({
  className,
  onUnlocked,
  dark = false,
}: {
  className?: string;
  onUnlocked: (rec: TouchRecord) => void;
  dark?: boolean;
}) {
  const { available, record } = useTouchId();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  if (!available || !record) return null;

  return (
    <div className={className}>
      <button
        type="button"
        disabled={busy}
        onClick={() => {
          setBusy(true);
          setError(null);
          void unlockWithTouchId()
            .then(onUnlocked)
            .catch((err: unknown) => {
              if (err instanceof DOMException && err.name === "NotAllowedError") {
                setError("Touch ID was cancelled.");
                return;
              }
              setError(err instanceof Error ? err.message : "Touch ID did not open.");
            })
            .finally(() => setBusy(false));
        }}
        className={cn(
          buttonVariants({ size: "md" }),
          "w-full",
          dark ? "bg-bronze text-ink hover:bg-bronze-soft" : "bg-ink text-parchment hover:bg-ink-soft",
        )}
      >
        <Fingerprint className="size-5" />
        {busy ? "Waiting for Touch ID…" : "Unlock with Touch ID"}
      </button>
      <p className={cn("mt-2 text-center text-[11px]", dark ? "text-parchment/45" : "text-ink-muted")}>
        Face ID and Windows Hello open the same door.
      </p>
      {error ? <p className="mt-2 text-center text-sm text-red-300">{error}</p> : null}
    </div>
  );
}

export function TouchRegisterCard({
  email,
  name,
  dark = false,
}: {
  email: string;
  name?: string;
  dark?: boolean;
}) {
  const { ready, available, record, setRecord } = useTouchId();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  if (!ready || !available) return null;

  const field = dark ? "border-white/8 bg-white/4 text-parchment" : "border-ink/10 bg-ivory text-ink";

  if (record && record.email === email.trim().toLowerCase()) {
    return (
      <div className={cn("rounded-2xl border p-5", field)}>
        <p className={cn("text-[10px] tracking-[0.2em] uppercase", dark ? "text-bronze" : "text-garnet")}>
          Touch ID
        </p>
        <h2 className="mt-1 font-display text-2xl">Saved on this device</h2>
        <p className={cn("mt-1 text-sm", dark ? "text-parchment/55" : "text-ink-muted")}>
          Fingerprint, Face ID, or Windows Hello will open the desk on this phone or computer.
        </p>
        <button
          type="button"
          className={cn("mt-4 text-sm", dark ? "text-parchment/50 hover:text-parchment" : "text-ink-muted hover:text-ink")}
          onClick={() => {
            forgetTouchId();
            setRecord(null);
          }}
        >
          Remove Touch ID
        </button>
      </div>
    );
  }

  return (
    <div className={cn("rounded-2xl border p-5", field)}>
      <p className={cn("text-[10px] tracking-[0.2em] uppercase", dark ? "text-bronze" : "text-garnet")}>
        Touch ID
      </p>
      <h2 className="mt-1 font-display text-2xl">Save this device</h2>
      <p className={cn("mt-1 text-sm", dark ? "text-parchment/55" : "text-ink-muted")}>
        Next time, unlock with your fingerprint or face. The password stays as a spare key.
      </p>
      {error ? <p className="mt-2 text-sm text-red-300">{error}</p> : null}
      <button
        type="button"
        disabled={busy}
        onClick={() => {
          setBusy(true);
          setError(null);
          void registerTouchId(email, name || email)
            .then((rec) => setRecord(rec))
            .catch((err: unknown) => {
              if (err instanceof DOMException && err.name === "NotAllowedError") {
                setError("Touch ID was cancelled.");
                return;
              }
              setError(err instanceof Error ? err.message : "Could not save Touch ID.");
            })
            .finally(() => setBusy(false));
        }}
        className={cn(
          buttonVariants({ size: "sm" }),
          "mt-4",
          dark ? "bg-bronze text-ink hover:bg-bronze-soft" : "",
        )}
      >
        <Fingerprint className="size-4" />
        {busy ? "Waiting…" : "Turn on Touch ID"}
      </button>
    </div>
  );
}

export function TouchLockGate({
  email,
  children,
}: {
  email: string;
  children: ReactNode;
}) {
  const { ready, available, record, unlocked, policy, setUnlocked } = useTouchId();

  useEffect(() => {
    if (!unlocked) return;
    if (policy.lockMode === "off") return;

    const onHide = () => {
      if (document.hidden && policy.lockOnHide) {
        lockDesk();
        setUnlocked(false);
      }
    };
    document.addEventListener("visibilitychange", onHide);

    let idleTimer = 0;
    const armIdle = () => {
      if (policy.lockMode !== "idle") return;
      window.clearTimeout(idleTimer);
      idleTimer = window.setTimeout(() => {
        lockDesk();
        setUnlocked(false);
      }, policy.idleMinutes * 60_000);
    };
    if (policy.lockMode === "idle") {
      armIdle();
      window.addEventListener("pointerdown", armIdle);
      window.addEventListener("keydown", armIdle);
    }

    return () => {
      document.removeEventListener("visibilitychange", onHide);
      window.clearTimeout(idleTimer);
      window.removeEventListener("pointerdown", armIdle);
      window.removeEventListener("keydown", armIdle);
    };
  }, [unlocked, policy, setUnlocked]);

  if (!ready) {
    return (
      <div className="grid min-h-dvh place-items-center bg-ivory text-ink">
        <p className="text-sm text-bronze">Opening the owner panel…</p>
      </div>
    );
  }
  const enrolled = Boolean(record && record.email === email.trim().toLowerCase());
  const mustLock =
    available && enrolled && policy.lockMode !== "off" && !unlocked;
  if (!mustLock) return <>{children}</>;

  return (
    <div className="grid min-h-dvh place-items-center bg-ivory px-5 text-ink">
      <div className="w-full max-w-sm text-center">
        <Fingerprint className="mx-auto size-12 text-bronze" />
        <p className="mt-6 text-[10px] tracking-[0.2em] text-bronze uppercase">SGJ Admin</p>
        <h1 className="mt-3 font-display text-4xl font-semibold">Touch ID</h1>
        <p className="mt-3 text-sm text-parchment/60">
          Biometric lock is on. Use your fingerprint or face to open the desk.
        </p>
        <TouchUnlockButton
          dark
          className="mt-8"
          onUnlocked={() => setUnlocked(true)}
        />
      </div>
    </div>
  );
}

export function BillsTouchGate({ children }: { children: ReactNode }) {
  const { ready, available, record, policy } = useTouchId();
  const [open, setOpen] = useState(billsUnlocked);

  useEffect(() => {
    setOpen(billsUnlocked());
  }, []);

  if (!ready) return <>{children}</>;
  if (!policy.lockBills || !available || !record) return <>{children}</>;
  if (open) return <>{children}</>;

  return (
    <div className="mx-auto max-w-md py-16 text-center">
      <Fingerprint className="mx-auto size-10 text-bronze" />
      <p className="mt-4 text-[10px] tracking-[0.2em] text-bronze uppercase">Second touch</p>
      <h1 className="mt-3 font-display text-3xl">Bills stay behind a fingerprint.</h1>
      <p className="mt-3 text-sm text-parchment/60">
        A sale bill is money leaving the house. Confirm it is your hand.
      </p>
      <TouchUnlockButton
        dark
        className="mt-8"
        onUnlocked={() => {
          markBillsUnlocked();
          setOpen(true);
        }}
      />
    </div>
  );
}

export function BiometricPanel({ email, name, dark = true }: { email: string; name?: string; dark?: boolean }) {
  const { ready, available, record, policy, setRecord, setPolicy } = useTouchId();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hostOk = typeof window !== "undefined" && touchIdHostOk();
  const field = dark ? "border-white/8 bg-white/4 text-parchment" : "border-ink/10 bg-ivory text-ink";
  const enrolled = Boolean(record && record.email === email.trim().toLowerCase());

  function save(next: BiometricPolicy) {
    writePolicy(next);
    setPolicy(next);
  }

  if (!ready) return <p className="text-sm text-parchment/50">Reading this device…</p>;

  return (
    <div className="space-y-6">
      <div className={cn("rounded-2xl border p-5", field)}>
        <p className={cn("text-[10px] tracking-[0.2em] uppercase", dark ? "text-bronze" : "text-garnet")}>
          This phone
        </p>
        <h2 className="mt-1 font-display text-2xl">
          {enrolled ? "Touch ID is saved" : "Turn on Touch ID"}
        </h2>
        <p className={cn("mt-1 text-sm", dark ? "text-parchment/55" : "text-ink-muted")}>
          {available
            ? "Fingerprint, Face ID, and Windows Hello open the same door. The password stays as a spare key."
            : "This browser has no biometric door. Open the shop in Safari on iPhone, or Chrome with Windows Hello."}
        </p>
        {!hostOk ? (
          <p className="mt-2 text-sm text-bronze">
            Bind Touch ID on the named shop on your phone — a number address will not hold a fingerprint.
          </p>
        ) : null}
        {error ? <p className="mt-2 text-sm text-red-300">{error}</p> : null}
        {available ? (
          enrolled ? (
            <button
              type="button"
              className={cn("mt-4 text-sm", dark ? "text-parchment/50 hover:text-parchment" : "text-ink-muted")}
              onClick={() => {
                forgetTouchId();
                setRecord(null);
              }}
            >
              Remove Touch ID from this device
            </button>
          ) : (
            <button
              type="button"
              disabled={busy}
              onClick={() => {
                setBusy(true);
                setError(null);
                void registerTouchId(email, name || email)
                  .then((rec) => setRecord(rec))
                  .catch((err: unknown) => setError(err instanceof Error ? err.message : "Could not save Touch ID."))
                  .finally(() => setBusy(false));
              }}
              className={cn(
                buttonVariants({ size: "sm" }),
                "mt-4",
                dark ? "bg-bronze text-ink hover:bg-bronze-soft" : "",
              )}
            >
              <Fingerprint className="size-4" />
              {busy ? "Waiting…" : "Turn on Touch ID"}
            </button>
          )
        ) : null}
      </div>

      <div className={cn("rounded-2xl border p-5", field)}>
        <p className={cn("text-[10px] tracking-[0.2em] uppercase", dark ? "text-bronze" : "text-garnet")}>
          When the desk locks
        </p>
        <div className="mt-4 grid gap-2">
          {(Object.keys(LOCK_MODE_COPY) as LockMode[]).map((id) => {
            const on = policy.lockMode === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => save({ ...policy, lockMode: id })}
                className={cn(
                  "rounded-xl border px-4 py-3 text-left",
                  on ? "border-bronze bg-bronze/15" : "border-white/10 hover:border-white/20",
                )}
              >
                <span className="text-sm font-medium">{LOCK_MODE_COPY[id].label}</span>
                <span className={cn("mt-0.5 block text-xs", dark ? "text-parchment/50" : "text-ink-muted")}>
                  {LOCK_MODE_COPY[id].note}
                </span>
              </button>
            );
          })}
        </div>
        {policy.lockMode === "idle" ? (
          <label className="mt-4 flex items-center justify-between gap-3 text-sm">
            Quiet after
            <select
              value={policy.idleMinutes}
              onChange={(e) => save({ ...policy, idleMinutes: Number(e.target.value) as IdleMinutes })}
              className="h-10 rounded-[10px] border border-white/15 bg-[#08110e] px-2"
            >
              <option value={1}>1 minute</option>
              <option value={5}>5 minutes</option>
              <option value={15}>15 minutes</option>
              <option value={30}>30 minutes</option>
            </select>
          </label>
        ) : null}
        <label className="mt-4 flex items-center justify-between gap-3 text-sm">
          <span>
            Lock when you leave the tab
            <span className={cn("mt-0.5 block text-xs", dark ? "text-parchment/45" : "text-ink-muted")}>
              WhatsApp, a call, or the home screen.
            </span>
          </span>
          <input
            type="checkbox"
            checked={policy.lockOnHide}
            onChange={(e) => save({ ...policy, lockOnHide: e.target.checked })}
            className="size-5 accent-bronze"
          />
        </label>
        <label className="mt-4 flex items-center justify-between gap-3 text-sm">
          <span>
            Second touch for bills
            <span className={cn("mt-0.5 block text-xs", dark ? "text-parchment/45" : "text-ink-muted")}>
              A sale bill asks for fingerprint again.
            </span>
          </span>
          <input
            type="checkbox"
            checked={policy.lockBills}
            onChange={(e) => save({ ...policy, lockBills: e.target.checked })}
            className="size-5 accent-bronze"
          />
        </label>
      </div>
    </div>
  );
}
