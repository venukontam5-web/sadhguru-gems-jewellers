import { pendingMigrations } from "../../scripts/migration-plan.mjs";

/** Which database backend is active. */
export type DbSource = "neon" | "pglite";

// An empty/whitespace DATABASE_URL (an easy misconfig in deploy UIs) must mean
// "unset" — otherwise production would silently run on the PGLite fallback.
const rawDatabaseUrl =
  typeof process !== "undefined" ? process.env.DATABASE_URL : undefined;
const databaseUrl =
  rawDatabaseUrl && rawDatabaseUrl.trim() ? rawDatabaseUrl : undefined;

/**
 * Active backend: real **Neon** when `DATABASE_URL` is set (deployed / configured
 * sandbox), otherwise a local embedded **PGLite** (Postgres compiled to WASM) so
 * the app has a working database even with nothing configured — the live preview
 * included. Swap in Neon later by just setting `DATABASE_URL`; no code changes.
 */
export const dbSource: DbSource = databaseUrl ? "neon" : "pglite";

/**
 * Minimal shared SQL surface, satisfied by both Neon and PGLite. Both the
 * tagged-template and `.query()` forms resolve to an array of row objects:
 *
 *   const sql = await getSql();
 *   const rows = await sql`select * from todos where id = ${id}`; // parameterized
 *   const rows2 = await sql.query("select * from todos where id = $1", [id]);
 */
export interface Sql {
  <T = Record<string, unknown>>(
    strings: TemplateStringsArray,
    ...values: unknown[]
  ): Promise<T[]>;
  query<T = Record<string, unknown>>(
    text: string,
    params?: unknown[],
  ): Promise<T[]>;
}

/**
 * Init state lives on globalThis as promises: dev HMR creates new instances of
 * this module, and two instances racing module-level state would open a second
 * pool or run two concurrent PGLite migration passes (whose duplicate
 * `_migrations` insert rejects — and would get memoized, poisoning every later
 * `getSql()`). A failed init clears its slot so the next call retries.
 */
const globalRef = globalThis as typeof globalThis & {
  __pgSqlPromise__?: Promise<Sql>;
  __pgliteInstance__?: Promise<import("@electric-sql/pglite").PGlite>;
  __pgliteMigrateChain__?: Promise<void>;
  __pgliteGlobFp__?: string;
  __productAlbumReady__?: boolean;
};

/**
 * Result-type parity: Postgres sends every value as text plus a type OID — the
 * JS value is the DRIVER's parsing choice, and pg and PGLite disagree (pg:
 * int8 -> string, date -> local-midnight Date; PGLite: int8 -> BigInt, which
 * JSON.stringify rejects, date -> UTC Date). Normalize both so preview and
 * production return identical, JSON-safe shapes:
 *   int8/bigint (incl. count(*)) -> number (past 2^53 loses precision — cast
 *                                   `::text` if you ever need huge integers)
 *   date                         -> 'YYYY-MM-DD' string
 *   interval                     -> Postgres interval text
 * numeric already comes back as a string on both (arbitrary precision).
 */
const OID_INT8 = 20;
const OID_DATE = 1082;
const OID_INTERVAL = 1186;
const identity = (v: string) => v;

/** Inlined at compile time so Vite reloads this module when a migrations/*.sql file is added. */
const MIGRATION_FILES = import.meta.glob("/migrations/*.sql", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;
const MIGRATION_FP = Object.keys(MIGRATION_FILES).sort().join("|");

type Run = <T>(text: string, params: unknown[]) => Promise<T[]>;

/** Wrap a query runner in the tagged-template + `.query()` `Sql` surface. */
function toSql(run: Run): Sql {
  const sql = (async <T = Record<string, unknown>>(
    strings: TemplateStringsArray,
    ...values: unknown[]
  ): Promise<T[]> => {
    // Rebuild with $1, $2, … placeholders so values stay parameterized.
    let text = strings[0];
    for (let i = 0; i < values.length; i += 1) text += `$${i + 1}${strings[i + 1]}`;
    return run<T>(text, values);
  }) as Sql;
  sql.query = <T = Record<string, unknown>>(text: string, params: unknown[] = []) =>
    run<T>(text, params);
  return sql;
}

export async function getSql(): Promise<Sql> {
  if (typeof window !== "undefined") {
    throw new Error("getSql() is server-only");
  }
  if (!globalRef.__pgSqlPromise__) {
    globalRef.__pgSqlPromise__ = (databaseUrl ? connectNeon() : connectPglite()).catch(
      (err) => {
        globalRef.__pgSqlPromise__ = undefined;
        throw err;
      },
    );
  }
  const sql = await globalRef.__pgSqlPromise__;
  // Re-apply pending files on HMR so a new migrations/*.sql lands without a restart.
  if (dbSource === "pglite") await openPglite();
  if (!globalRef.__productAlbumReady__) {
    try {
      await sql.query(`alter table products add column if not exists gallery text not null default '[]'`);
      await sql.query(`alter table products add column if not exists vendor_id integer`);
      globalRef.__productAlbumReady__ = true;
    } catch {
      // products table may still be mid-migration on first boot
    }
  }
  return sql;
}

async function connectNeon(): Promise<Sql> {
  const pg = await import("pg");
  const pool = new pg.Pool({
    connectionString: databaseUrl,
    max: 5,
    types: {
      getTypeParser: (oid, format) => {
        if (oid === OID_INT8) return Number;
        if (oid === OID_DATE) return identity;
        if (oid === OID_INTERVAL) return identity;
        return pg.types.getTypeParser(oid, format);
      },
    },
  });
  const run: Run = async (text, params) => {
    const result = await pool.query(text, params);
    return result.rows as never;
  };
  return toSql(run);
}

async function connectPglite(): Promise<Sql> {
  const pg = await openPglite();
  const run: Run = async (text, params) => {
    const result = await pg.query(text, params ?? []);
    return (result.rows ?? []) as never;
  };
  return toSql(run);
}

async function openPglite(): Promise<import("@electric-sql/pglite").PGlite> {
  if (!globalRef.__pgliteInstance__) {
    globalRef.__pgliteInstance__ = (async () => {
      const { PGlite } = await import("@electric-sql/pglite");
      const pg = new PGlite({
        parsers: {
          [OID_INT8]: Number,
          [OID_DATE]: identity,
          [OID_INTERVAL]: identity,
        },
      });
      await pg.waitReady;
      await pg.exec(
        "create table if not exists _migrations (name text primary key, applied_at timestamptz not null default now())",
      );
      return pg;
    })().catch((err) => {
      globalRef.__pgliteInstance__ = undefined;
      globalRef.__pgliteGlobFp__ = undefined;
      throw err;
    });
  }
  const pg = await globalRef.__pgliteInstance__;

  // Apply migrations/ (the single schema source) so preview matches production.
  // SQL is inlined by the bundler via import.meta.glob (no runtime fs); applied
  // files are tracked in _migrations. The glob does not descend, so the opt-in
  // auth schema under migrations/auth/ stays out. Fingerprint skips a second
  // pass until a new *.sql file reloads this module.
  const migrate = async (): Promise<void> => {
    if (globalRef.__pgliteGlobFp__ === MIGRATION_FP) return;
    const appliedRows = await pg.query<{ name: string }>("select name from _migrations");
    const applied = (appliedRows.rows ?? []).map((r) => r.name);
    const pending = pendingMigrations(Object.keys(MIGRATION_FILES), applied);
    for (const { name, path } of pending) {
      const text = MIGRATION_FILES[path];
      if (!text) continue;
      await pg.exec(text);
      await pg.query("insert into _migrations (name) values ($1)", [name]);
      console.info(`[db] applied ${name}`);
    }
    globalRef.__pgliteGlobFp__ = MIGRATION_FP;
  };
  globalRef.__pgliteMigrateChain__ = (globalRef.__pgliteMigrateChain__ ?? Promise.resolve())
    .then(migrate)
    .catch((err) => {
      globalRef.__pgliteMigrateChain__ = undefined;
      throw err;
    });
  await globalRef.__pgliteMigrateChain__;
  return pg;
}

/**
 * The live PGLite client (Better Auth dialect). Throws when `DATABASE_URL` is set
 * (that path uses Neon).
 */
export async function getPglite(): Promise<import("@electric-sql/pglite").PGlite> {
  if (dbSource !== "pglite") {
    throw new Error("getPglite() is only available on the PGLite fallback (no DATABASE_URL)");
  }
  await getSql();
  const pg = await globalRef.__pgliteInstance__;
  if (!pg) throw new Error("PGLite instance failed to initialize");
  return pg;
}

/**
 * Finish DB bootstrap before the server handles traffic.
 *
 * - **PGLite** (preview / no `DATABASE_URL`): open the in-memory DB and apply
 *   `migrations/*.sql`. Idempotent — concurrent callers share one promise.
 * - **Neon**: no-op (pool is created lazily on first query).
 *
 * Vite `configureServer` awaits this at dev startup; production imports of this
 * module kick it off immediately (see bottom of file).
 */
export function ensureDbReady(): Promise<void> {
  if (dbSource !== "pglite") return Promise.resolve();
  return getSql().then(() => undefined);
}

// Server-only eager start: kick PGLite bootstrap as soon as this module loads in
// Node. Client bundles never hit this path (`getSql` throws in the browser).
const globalBoot = globalThis as typeof globalThis & {
  __pgBootstrapPromise__?: Promise<void>;
};
if (typeof window === "undefined" && dbSource === "pglite") {
  globalBoot.__pgBootstrapPromise__ ??= ensureDbReady().catch((err) => {
    globalBoot.__pgBootstrapPromise__ = undefined;
    console.error("[db] PGLite bootstrap failed:", err);
    throw err;
  });
}

// HMR rememoize: product gallery 0023
