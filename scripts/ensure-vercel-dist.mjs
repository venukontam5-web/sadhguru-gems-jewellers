#!/usr/bin/env node
/**
 * TanStack Start's Vercel preset hunts for `dist`. Nitro hangs the real shop
 * in `.vercel/output` (functions + static). This writes a home page into dist
 * so that preset does not 404, without putting index.html into the Nitro
 * static cabinet (that would skip the server on `/`).
 */
import { cpSync, existsSync, mkdirSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const pack = join(root, ".vercel/output/static");
const dist = join(root, "dist");
const assetsDir = join(pack, "assets");

mkdirSync(dist, { recursive: true });
if (existsSync(pack)) {
  cpSync(pack, dist, { recursive: true });
}

function first(prefix, ext) {
  if (!existsSync(assetsDir)) return "";
  return readdirSync(assetsDir).find((n) => n.startsWith(prefix) && n.endsWith(ext)) || "";
}

const css = first("styles-", ".css");
const js = first("client-", ".js") || first("index-", ".js");

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"/>
  <title>Sadhguru Gems & Jewellers</title>
  <link rel="canonical" href="https://www.sadhgurugemsandjewellers.com/"/>
  ${css ? `<link rel="stylesheet" href="/assets/${css}"/>` : ""}
</head>
<body style="margin:0;background:#FFFFF0;color:#1A1410;font-family:Georgia,serif">
  <main style="max-width:40rem;margin:0 auto;padding:3rem 1.25rem">
    <p style="letter-spacing:.2em;text-transform:uppercase;font-size:.7rem;color:#8C2F39">Solapur</p>
    <h1 style="font-size:2rem;font-weight:600">Sadhguru Gems & Jewellers</h1>
    <p>Certified Navratna gemstones, gold and silver. 106 New Sunil Nagar, Akkalkot Road, Kumbhari.</p>
    <p><a href="https://www.sadhgurugemsandjewellers.com/" style="color:#8C2F39">Open the live shop</a></p>
  </main>
  ${js ? `<script type="module" src="/assets/${js}"></script>` : ""}
</body>
</html>
`;

writeFileSync(join(dist, "index.html"), html);
writeFileSync(join(dist, ".sgj-hang"), "nitro-vercel\n");
