const STORE = "sgj.touch-id.v1";
const UNLOCK = "sgj.touch-unlocked";
const BILLS_UNLOCK = "sgj.bills-unlocked";
const POLICY = "sgj.biometric.v1";

export type TouchRecord = {
  credentialId: string;
  email: string;
  name: string;
  createdAt: string;
};

export type LockMode = "off" | "session" | "idle";
export type IdleMinutes = 1 | 5 | 15 | 30;

export type BiometricPolicy = {
  lockMode: LockMode;
  idleMinutes: IdleMinutes;
  lockOnHide: boolean;
  lockBills: boolean;
};

export const DEFAULT_POLICY: BiometricPolicy = {
  lockMode: "session",
  idleMinutes: 5,
  lockOnHide: true,
  lockBills: true,
};

export const LOCK_MODE_COPY: Record<LockMode, { label: string; note: string }> = {
  off: { label: "Open once", note: "Touch ID signs you in. The desk stays open in this tab." },
  session: { label: "Every visit", note: "Each new tab asks for fingerprint or face." },
  idle: { label: "After idle", note: "The desk locks when the counter is quiet." },
};

export function readPolicy(): BiometricPolicy {
  if (typeof window === "undefined") return DEFAULT_POLICY;
  try {
    const raw = localStorage.getItem(POLICY);
    if (!raw) return DEFAULT_POLICY;
    const p = JSON.parse(raw) as Partial<BiometricPolicy>;
    return {
      lockMode: p.lockMode === "off" || p.lockMode === "idle" || p.lockMode === "session" ? p.lockMode : "session",
      idleMinutes: ([1, 5, 15, 30] as const).includes(p.idleMinutes as IdleMinutes)
        ? (p.idleMinutes as IdleMinutes)
        : 5,
      lockOnHide: p.lockOnHide !== false,
      lockBills: p.lockBills !== false,
    };
  } catch {
    return DEFAULT_POLICY;
  }
}

export function writePolicy(next: BiometricPolicy) {
  localStorage.setItem(POLICY, JSON.stringify(next));
}

function toB64(buf: ArrayBuffer) {
  const bytes = new Uint8Array(buf);
  let s = "";
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromB64(s: string) {
  const pad = s.replace(/-/g, "+").replace(/_/g, "/");
  const bin = atob(pad);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out.buffer;
}

function relyingParty(): PublicKeyCredentialRpEntity {
  const host = location.hostname;
  const ip = /^(\d+\.){3}\d+$/.test(host) || host.startsWith("[");
  if (ip) return { name: "Sadhguru Gems & Jewellers" };
  return { name: "Sadhguru Gems & Jewellers", id: host };
}

export function readTouchRecord(): TouchRecord | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORE);
    if (!raw) return null;
    const rec = JSON.parse(raw) as TouchRecord;
    if (!rec?.credentialId || !rec.email) return null;
    return rec;
  } catch {
    return null;
  }
}

export function forgetTouchId() {
  localStorage.removeItem(STORE);
  sessionStorage.removeItem(UNLOCK);
}

export function deskUnlocked() {
  return sessionStorage.getItem(UNLOCK) === "1";
}

export function markDeskUnlocked() {
  sessionStorage.setItem(UNLOCK, "1");
  sessionStorage.setItem(BILLS_UNLOCK, "1");
}

export function lockDesk() {
  sessionStorage.removeItem(UNLOCK);
  sessionStorage.removeItem(BILLS_UNLOCK);
}

export function billsUnlocked() {
  return sessionStorage.getItem(BILLS_UNLOCK) === "1";
}

export function markBillsUnlocked() {
  sessionStorage.setItem(BILLS_UNLOCK, "1");
}

export function lockBillsDrawer() {
  sessionStorage.removeItem(BILLS_UNLOCK);
}

export async function touchIdAvailable(): Promise<boolean> {
  if (typeof window === "undefined") return false;
  if (!window.isSecureContext) return false;
  if (!window.PublicKeyCredential) return false;
  try {
    return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
  } catch {
    return false;
  }
}

function userHandle(email: string) {
  const enc = new TextEncoder().encode(email);
  const out = new Uint8Array(32);
  out.set(enc.slice(0, 32));
  return out;
}

export function touchIdHostOk() {
  if (typeof location === "undefined") return false;
  const host = location.hostname;
  return !(/^(\d+\.){3}\d+$/.test(host) || host.startsWith("["));
}

function webAuthnError(err: unknown): Error {
  const msg = err instanceof Error ? err.message : String(err);
  if (/invalid domain/i.test(msg) || (err instanceof DOMException && err.name === "SecurityError")) {
    return new Error("Open the named shop on this phone. Touch ID will not bind to a number address.");
  }
  if (err instanceof DOMException && err.name === "NotAllowedError") {
    return new Error("Touch ID was cancelled.");
  }
  return err instanceof Error ? err : new Error("Touch ID did not open.");
}

export async function registerTouchId(email: string, name: string): Promise<TouchRecord> {
  try {
    const challenge = crypto.getRandomValues(new Uint8Array(32));
    const cred = (await navigator.credentials.create({
      publicKey: {
        challenge,
        rp: relyingParty(),
        user: {
          id: userHandle(email),
          name: email,
          displayName: name || email,
        },
        pubKeyCredParams: [
          { type: "public-key", alg: -7 },
          { type: "public-key", alg: -257 },
        ],
        authenticatorSelection: {
          authenticatorAttachment: "platform",
          userVerification: "required",
          residentKey: "preferred",
        },
        timeout: 60_000,
      },
    })) as PublicKeyCredential | null;
    if (!cred) throw new Error("Touch ID was cancelled.");
    const rec: TouchRecord = {
      credentialId: toB64(cred.rawId),
      email: email.trim().toLowerCase(),
      name: name || email,
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem(STORE, JSON.stringify(rec));
    markDeskUnlocked();
    return rec;
  } catch (err) {
    throw webAuthnError(err);
  }
}

export async function unlockWithTouchId(): Promise<TouchRecord> {
  try {
    const rec = readTouchRecord();
    if (!rec) throw new Error("Touch ID is not saved on this device.");
    const challenge = crypto.getRandomValues(new Uint8Array(32));
    const rp = relyingParty();
    const cred = (await navigator.credentials.get({
      publicKey: {
        challenge,
        ...(rp.id ? { rpId: rp.id } : {}),
        allowCredentials: [
          {
            id: fromB64(rec.credentialId),
            type: "public-key",
            transports: ["internal"],
          },
        ],
        userVerification: "required",
        timeout: 60_000,
      },
    })) as PublicKeyCredential | null;
    if (!cred) throw new Error("Touch ID was cancelled.");
    markDeskUnlocked();
    return rec;
  } catch (err) {
    throw webAuthnError(err);
  }
}
