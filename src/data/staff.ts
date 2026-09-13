import { SITE } from "./site";
import type { AppUser } from "@/lib/auth/use-current-user";

/** Seed emails that may open the owner desk. Extra team emails live in staff_members. */
export const SEED_STAFF_EMAILS = [
  SITE.email,
  "venukontam5@gmail.com",
  "owner@sadhgurugems.test",
  "admin@sadhgurugems.test",
].map((e) => e.trim().toLowerCase());

const SEED = new Set(SEED_STAFF_EMAILS);

export function isStaffEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const e = email.trim().toLowerCase();
  if (SEED.has(e)) return true;
  return e.endsWith("@sadhgurugemsandjewellers.com");
}

export function isStaffUser(user: AppUser | null | undefined): boolean {
  if (!user) return false;
  if (user.isDevFallback) return true;
  return isStaffEmail(user.primaryEmail);
}
