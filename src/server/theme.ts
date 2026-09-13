import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSql } from "@/lib/db";
import { capMiddleware } from "@/server/staff";
import { DEFAULT_THEME, type SiteTheme } from "@/lib/theme";

type Row = {
  preset: string;
  display_font: string;
  body_font: string;
  font_size: string;
  parchment: string;
  ink: string;
  garnet: string;
  bronze: string;
};

function mapRow(r: Row): SiteTheme {
  return {
    preset: (r.preset as SiteTheme["preset"]) || "heritage",
    displayFont: r.display_font,
    bodyFont: r.body_font,
    fontSize: (r.font_size as SiteTheme["fontSize"]) || "medium",
    parchment: r.parchment,
    ink: r.ink,
    garnet: r.garnet,
    bronze: r.bronze,
  };
}

export const getPublicTheme = createServerFn({ method: "GET" }).handler(async () => {
  const sql = await getSql();
  const rows = await sql<Row>`select * from site_theme where id = 1 limit 1`;
  return rows[0] ? mapRow(rows[0]) : DEFAULT_THEME;
});

const themeInput = z.object({
  preset: z.string(),
  displayFont: z.string().min(1).max(60),
  bodyFont: z.string().min(1).max(60),
  fontSize: z.enum(["small", "medium", "large", "xl"]),
  parchment: z.string().regex(/^#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})$/),
  ink: z.string().regex(/^#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})$/),
  garnet: z.string().regex(/^#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})$/),
  bronze: z.string().regex(/^#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})$/),
});

export const saveSiteTheme = createServerFn({ method: "POST" })
  .middleware([capMiddleware("appearance")])
  .validator(themeInput)
  .handler(async ({ data }) => {
    const sql = await getSql();
    await sql`
      insert into site_theme (id, preset, display_font, body_font, font_size, parchment, ink, garnet, bronze, updated_at)
      values (
        1, ${data.preset}, ${data.displayFont}, ${data.bodyFont}, ${data.fontSize},
        ${data.parchment}, ${data.ink}, ${data.garnet}, ${data.bronze}, now()
      )
      on conflict (id) do update set
        preset = excluded.preset,
        display_font = excluded.display_font,
        body_font = excluded.body_font,
        font_size = excluded.font_size,
        parchment = excluded.parchment,
        ink = excluded.ink,
        garnet = excluded.garnet,
        bronze = excluded.bronze,
        updated_at = now()`;
    return { ok: true as const };
  });
