import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { randomBytes } from "node:crypto";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { capMiddleware } from "@/server/staff";

const ALLOWED: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "video/mp4": ".mp4",
  "video/webm": ".webm",
};

export const ownerUploadMedia = createServerFn({ method: "POST" })
  .middleware([capMiddleware("slides")])
  .validator(
    z.object({
      filename: z.string().max(80),
      mime: z.string().max(40),
      dataUrl: z.string().min(20).max(28_000_000),
    }),
  )
  .handler(async ({ data }) => {
    const ext = ALLOWED[data.mime];
    if (!ext) throw new Error("Use a JPG, PNG, WEBP, MP4 or WEBM file.");
    const comma = data.dataUrl.indexOf(",");
    if (comma < 0) throw new Error("The file did not read.");
    const buf = Buffer.from(data.dataUrl.slice(comma + 1), "base64");
    if (data.mime.startsWith("image/") && buf.length > 8_000_000) {
      throw new Error("Image is too large. Keep it under 8 MB.");
    }
    if (data.mime.startsWith("video/") && buf.length > 20_000_000) {
      throw new Error("Video is too large. Keep it under 20 MB, or paste a YouTube link.");
    }
    const dir = join(process.cwd(), "public", "uploads");
    await mkdir(dir, { recursive: true });
    const id = randomBytes(4).toString("hex");
    const safe =
      data.filename
        .replace(/[^a-zA-Z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
        .slice(0, 24) || "slide";
    const name = `${safe}-${id}${ext}`;
    await writeFile(join(dir, name), buf);
    return { path: `/uploads/${name}` as const };
  });

export const ownerUploadProductImage = createServerFn({ method: "POST" })
  .middleware([capMiddleware("products")])
  .validator(
    z.object({
      filename: z.string().max(80),
      dataUrl: z.string().min(20).max(28_000_000),
    }),
  )
  .handler(async ({ data }) => {
    const comma = data.dataUrl.indexOf(",");
    if (comma < 0) throw new Error("The photograph did not read.");
    const buf = Buffer.from(data.dataUrl.slice(comma + 1), "base64");
    if (buf.length > 8_000_000) throw new Error("Image is too large. Keep it under 8 MB.");
    const dir = join(process.cwd(), "public", "uploads");
    await mkdir(dir, { recursive: true });
    const id = randomBytes(4).toString("hex");
    const safe =
      data.filename
        .replace(/[^a-zA-Z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
        .slice(0, 24) || "piece";
    const name = `${safe}-${id}.jpg`;
    await writeFile(join(dir, name), buf);
    return { path: `/uploads/${name}` as const };
  });
