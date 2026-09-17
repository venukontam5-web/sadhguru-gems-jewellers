import { getSql } from "@/lib/db";

export async function loadHouseWebhook() {
  const sql = await getSql();
  await sql`
    create table if not exists api_keys (
      slot text primary key,
      label text not null,
      secret text not null default '',
      fingerprint text not null default '',
      kind text not null default 'paste',
      verified boolean not null default false,
      verified_at timestamptz,
      note text not null default '',
      updated_at timestamptz not null default now()
    )`;
  const [row] = await sql<{ secret: string }>`select secret from api_keys where slot = 'house_webhook'`;
  return (row?.secret || "").trim();
}
