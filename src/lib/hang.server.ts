import { AsyncLocalStorage } from "node:async_hooks";
import { getSql, setSqlTap } from "@/lib/db";

/**
 * Hang context — AsyncLocalStorage.run only (never enterWith; it leaks).
 * createHook() is not enabled. bindHang re-enters the same hang for detached work.
 */
type Slow = { ms: number; text: string };
type Hang = { name: string; started: number; sqlMs: number; sqlN: number; ping: number; slow: Slow[]; recorded?: boolean };
export type HangPulse = {
  name: string;
  at: string;
  ms: number;
  sqlN: number;
  sqlMs: number;
  ping: number;
  slow: Slow[];
};

const store = new AsyncLocalStorage<Hang>();
const recent: HangPulse[] = [];
const MAX = 12;

function noteSql(ms: number, text: string) {
  const hang = store.getStore();
  if (!hang) return;
  hang.sqlN += 1;
  hang.sqlMs += ms;
  if (ms >= 40) {
    hang.slow.push({ ms, text: text.replace(/\s+/g, " ").trim().slice(0, 72) });
  }
}

setSqlTap(noteSql);

function record(hang: Hang) {
  if (hang.recorded) return;
  hang.recorded = true;
  recent.unshift({
    name: hang.name,
    at: new Date().toISOString(),
    ms: Date.now() - hang.started,
    sqlN: hang.sqlN,
    sqlMs: hang.sqlMs,
    ping: hang.ping,
    slow: hang.slow.slice(0, 4),
  });
  if (recent.length > MAX) recent.pop();
}

export function getHang() {
  return store.getStore() ?? null;
}

export function listHangs() {
  return recent.slice();
}

/** Re-enter this tap’s hang for a callback that would otherwise drop context. */
export function bindHang<A extends unknown[], R>(fn: (...args: A) => R): (...args: A) => R {
  const hang = store.getStore();
  if (!hang) return fn;
  return (...args: A) => store.run(hang, () => fn(...args));
}

export function withHang<T>(name: string, fn: () => Promise<T>): Promise<T> {
  const hang: Hang = { name, started: Date.now(), sqlMs: 0, sqlN: 0, ping: 0, slow: [] };
  return store.run(hang, async () => {
    try {
      return await fn();
    } finally {
      record(hang);
    }
  });
}

export async function pulseHang() {
  const run = async () => {
    const sql = await getSql();
    const t0 = Date.now();
    await sql`select 1 as ok`;
    await Promise.all([sql`select 1 as a`, sql`select 1 as b`]);
    await new Promise<void>((resolve, reject) => {
      const tick = bindHang(async () => {
        try {
          await sql`select 1 as after_tick`;
          resolve();
        } catch (err) {
          reject(err);
        }
      });
      setTimeout(() => {
        void tick();
      }, 0);
    });
    const ping = Date.now() - t0;
    const hang = store.getStore();
    if (hang) {
      hang.ping = ping;
      hang.name = "pulse";
      record(hang);
    }
    return {
      ping,
      sqlN: hang?.sqlN ?? 0,
      propagated: (hang?.sqlN ?? 0) >= 4,
      hangs: listHangs(),
    };
  };
  if (store.getStore()) return run();
  return withHang("pulse", run);
}
