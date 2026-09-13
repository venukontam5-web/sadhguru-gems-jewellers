import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { addStaff, listStaff, removeStaff, setStaffRole } from "@/server/staff";
import { DESK_ROLES, ROLE_COPY, type DeskRole } from "@/lib/rbac";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/owner/users")({
  component: OwnerUsers,
});

function OwnerUsers() {
  const [rows, setRows] = useState<{ email: string; name: string; role: DeskRole; loginId: string }[]>([]);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<DeskRole>("counter");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const load = useCallback(() => {
    void listStaff().then(setRows).catch(() => setRows([]));
  }, []);
  useEffect(load, [load]);

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
    <div>
      <p className="text-[10px] tracking-[0.2em] text-bronze uppercase">House</p>
      <h1 className="font-display text-4xl font-semibold">Staff access login ID</h1>
      <p className="mt-2 max-w-xl text-sm text-parchment/60">
        Each person on the desk gets a login ID (SGJ-01). They open Admin login with that ID or
        their email, plus the password. Visitors never see this list.
      </p>
      <ul className="mt-8 space-y-2">
        {rows.map((r) => (
          <li
            key={r.email}
            className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/8 bg-white/4 px-4 py-3 text-sm"
          >
            <span className="min-w-0">
              <span className="font-mono text-bronze">{r.loginId || "—"}</span>
              <span className="mt-0.5 block text-parchment">{r.email}</span>
              {r.name ? <span className="text-parchment/45">{r.name}</span> : null}
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
      <form onSubmit={(e) => void onAdd(e)} className="mt-6 flex flex-wrap gap-2">
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
      <dl className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {DESK_ROLES.map((id) => (
          <div key={id} className="rounded-2xl border border-white/8 bg-white/4 p-4">
            <dt className="text-xs font-medium text-bronze">{ROLE_COPY[id].label}</dt>
            <dd className="mt-1 text-[12px] leading-relaxed text-parchment/55">{ROLE_COPY[id].ring}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
