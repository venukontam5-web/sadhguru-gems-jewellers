#!/usr/bin/env node
import { cpSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const dist = join(process.cwd(), "dist");
const pack = join(process.cwd(), ".vercel/output/static");

mkdirSync(dist, { recursive: true });
if (existsSync(pack)) {
  cpSync(pack, dist, { recursive: true });
}
writeFileSync(join(dist, ".sgj-hang"), "nitro-vercel\n");
