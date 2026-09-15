type Slot<T> = { at: number; value: T };

const slots = new Map<string, Slot<unknown>>();
const TTL = 45_000;

export function memoRead<T>(key: string): T | null {
  const s = slots.get(key) as Slot<T> | undefined;
  if (!s) return null;
  if (Date.now() - s.at > TTL) {
    slots.delete(key);
    return null;
  }
  return s.value;
}

export function memoWrite<T>(key: string, value: T): T {
  slots.set(key, { at: Date.now(), value });
  return value;
}

export function memoClear(key: string) {
  slots.delete(key);
}
