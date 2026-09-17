import { AsyncLocalStorage } from "node:async_hooks";
import { getSql, setSqlTap } from "@/lib/db";

/**
 * Request hang — AsyncLocalStorage (the supported Async Hooks API).
 * Do not enable `createHook()`; that fires on every Promise and slows Node.
 */
type Slow = { ms: number; text: string };
type Hang = { started: number; sqlMs: number; sqlN: number; slow: Slow[] };
type Pulse = { at: string; ms: number; sqlN: number; sqlMs: number; ping: number; slow: Slow[] };

const store = new AsyncLocalStorage<Hang>();
const recent: Pulse[] = [];
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

export async function pulseHang() {
  const hang: Hang = { started: Date.now(), sqlMs: 0, sqlN: 0, slow: [] };
  return store.run(hang, async () => {
    const sql = await getSql();
    const t0 = Date.now();
    await sql`select 1 as ok`;
    const ping = Date.now() - t0;
    const ms = Date.now() - hang.started;
    const pulse: Pulse = {
      at: new Date().toISOString(),
      ms,
      sqlN: hang.sqlN,
      sqlMs: hang.sqlMs,
      ping,
      slow: hang.slow.slice(0, 4),
    };
    recent.unshift(pulse);
    if (recent.length > MAX) recent.pop();
    return { ping, sqlN: hang.sqlN, hangs: recent.slice() };
  });
}
