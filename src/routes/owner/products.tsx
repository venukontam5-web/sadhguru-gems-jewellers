import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { ownerDeleteProduct, ownerListProducts, ownerSaveProduct } from "@/server/catalogue";
import { PRODUCT_CATEGORIES, inr, type ShopProduct } from "@/lib/shop";
import { stockStatus } from "@/lib/inventory";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { StockPill } from "@/components/inventory-nav";
import { DeskTabs } from "@/components/owner-tabs";
import { ProductPhoto } from "@/components/product-photo";
import { ownerUploadProductImage } from "@/server/media";
import { layOnIvory } from "@/lib/ivory-photo";

export const Route = createFileRoute("/owner/products")({
  component: OwnerProducts,
});

const MAX_SHOTS = 5;

const empty = {
  name: "",
  slug: "",
  category: "Gemstones",
  priceInr: 1000,
  compareAt: "" as string | number,
  stock: 1,
  imagePath: "/images/ruby.jpg",
  gallery: [] as string[],
  badge: "",
  active: true,
  description: "",
};

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function OwnerProducts() {
  const [rows, setRows] = useState<ShopProduct[]>([]);
  const [q, setQ] = useState("");
  const [tab, setTab] = useState("All");
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<number | undefined>();
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [slugLocked, setSlugLocked] = useState(false);

  const load = useCallback(() => {
    void ownerListProducts().then(setRows);
  }, []);
  useEffect(load, [load]);

  const filtered = rows.filter((p) => {
    if (q && !p.name.toLowerCase().includes(q.toLowerCase())) return false;
    if (tab === "Hidden") return !p.active;
    if (tab === "All") return true;
    return p.category === tab;
  });

  const tabs = [
    { id: "All", label: "All", count: rows.length },
    ...PRODUCT_CATEGORIES.map((c) => ({
      id: c,
      label: c,
      count: rows.filter((p) => p.category === c).length,
    })),
    { id: "Hidden", label: "Hidden", count: rows.filter((p) => !p.active).length },
  ];

  function startNew() {
    setEditId(undefined);
    setForm(empty);
    setUploadError(null);
    setSaveError(null);
    setSlugLocked(false);
    setOpen(true);
  }

  function startEdit(p: ShopProduct) {
    setEditId(p.id);
    setForm({
      name: p.name,
      slug: p.slug,
      category: p.category,
      priceInr: p.priceInr,
      compareAt: p.compareAt ?? "",
      stock: p.stock,
      imagePath: p.imagePath,
      gallery: (p.images?.length ? p.images : [p.imagePath]).filter(Boolean).slice(0, MAX_SHOTS),
      badge: p.badge,
      active: p.active,
      description: p.description,
    });
    setUploadError(null);
    setSaveError(null);
    setSlugLocked(true);
    setOpen(true);
  }

  async function onPhotos(files: FileList | File[] | undefined, slot?: number) {
    if (!files || (files instanceof FileList && !files.length)) return;
    const list = Array.from(files as FileList | File[]);
    setUploading(true);
    setUploadError(null);
    try {
      const uploaded: string[] = [];
      for (const file of list.slice(0, MAX_SHOTS)) {
        const ivory = await layOnIvory(file);
        const res = await ownerUploadProductImage({
          data: { filename: ivory.filename, dataUrl: ivory.dataUrl },
        });
        uploaded.push(res.path);
      }
      setForm((f) => {
        const current = (f.gallery.length ? f.gallery : f.imagePath ? [f.imagePath] : []).filter(
          (p) => p && p !== "/images/ruby.jpg",
        );
        let next = [...current];
        if (slot != null) {
          next[slot] = uploaded[0] ?? next[slot];
          if (uploaded.length > 1) next = [...next.slice(0, slot + 1), ...uploaded.slice(1), ...next.slice(slot + 1)];
        } else {
          next = [...next, ...uploaded];
        }
        next = next.filter(Boolean).slice(0, MAX_SHOTS);
        return { ...f, gallery: next, imagePath: next[0] || f.imagePath };
      });
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "The photograph did not save.");
    } finally {
      setUploading(false);
    }
  }

  async function save() {
    const name = form.name.trim();
    if (!name) {
      setSaveError("Give the piece a name, then press Save.");
      return;
    }
    setSaving(true);
    setSaveError(null);
    try {
      const compareRaw = form.compareAt === "" ? null : Number(form.compareAt);
      await ownerSaveProduct({
        data: {
          id: editId,
          name,
          slug: form.slug || slugify(name),
          category: form.category,
          priceInr: Number(form.priceInr) || 0,
          compareAt: compareRaw != null && Number.isFinite(compareRaw) ? compareRaw : null,
          stock: Number(form.stock) || 0,
          imagePath: (form.gallery[0] || form.imagePath) || "/images/ruby.jpg",
          gallery: form.gallery.filter(Boolean).slice(0, MAX_SHOTS),
          badge: form.badge,
          active: form.active,
          description: form.description,
        },
      });
      setOpen(false);
      load();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "The piece did not save. Try again.");
    } finally {
      setSaving(false);
    }
  }

  const field =
    "h-10 w-full rounded-lg border border-white/12 bg-black/30 px-3 text-sm text-parchment outline-none focus:border-bronze";

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[10px] tracking-[0.2em] text-bronze uppercase">Catalogue</p>
          <h1 className="font-display text-4xl font-semibold">Products</h1>
          <p className="mt-1 text-sm text-parchment/60">Stones, malas, pearls and brass you sell.</p>
        </div>
        <Button type="button" onClick={startNew} className="bg-bronze text-ink hover:bg-bronze-soft">
          + Add new
        </Button>
      </div>
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search…"
        className={cn(field, "mt-6 max-w-sm")}
      />
      <DeskTabs tabs={tabs} value={tab} onChange={setTab} label="Product trays" />
      <div className="mt-4 overflow-x-auto rounded-2xl border border-white/8">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="text-xs tracking-wide text-parchment/50 uppercase">
            <tr>
              <th className="px-4 py-3 font-medium">Product</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">Price</th>
              <th className="px-4 py-3 font-medium">Stock</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr
                key={p.id}
                className="cursor-pointer border-t border-white/8 hover:bg-white/4"
                onClick={() => startEdit(p)}
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <ProductPhoto
                      src={p.imagePath}
                      alt=""
                      rounded="rounded-lg"
                      className="size-12 shrink-0"
                    />
                    <span>{p.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-parchment/70">{p.category}</td>
                <td className="px-4 py-3">{inr(p.priceInr)}</td>
                <td className="px-4 py-3">{p.stock}</td>
                <td className="px-4 py-3">
                  <StockPill status={stockStatus(p.stock, p.reorderAt ?? 2)} />
                  {!p.active ? <span className="mt-1 block text-[11px] text-parchment/45">Hidden</span> : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!filtered.length ? (
          <p className="px-4 py-10 text-center text-sm text-parchment/50">
            {q ? "No product matches that search." : "Nothing in this tray."}
          </p>
        ) : null}
      </div>

      {open ? (
        <div className="fixed inset-0 z-50 grid place-items-end bg-black/60 p-0 sm:place-items-center sm:p-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void save();
            }}
            className="flex max-h-[92vh] w-full max-w-xl flex-col overflow-hidden rounded-t-2xl border border-white/10 bg-[#0f1c18] sm:rounded-2xl"
          >
            <div className="flex items-center justify-between border-b border-white/8 px-5 py-4">
              <h2 className="font-display text-2xl">{editId ? "Edit product" : "New product"}</h2>
              <button type="button" onClick={() => setOpen(false)} className="text-parchment/60" aria-label="Close">
                ×
              </button>
            </div>
            <div className="grid flex-1 gap-3 overflow-auto p-5 sm:grid-cols-2">
              <label className="text-xs text-parchment/60 sm:col-span-2">
                Name *
                <input
                  className={cn(field, "mt-1")}
                  value={form.name}
                  autoFocus
                  required
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      name: e.target.value,
                      slug: slugLocked ? f.slug : slugify(e.target.value),
                    }))
                  }
                />
              </label>
              <label className="text-xs text-parchment/60">
                Slug
                <input
                  className={cn(field, "mt-1")}
                  value={form.slug}
                  onChange={(e) => {
                    setSlugLocked(true);
                    setForm((f) => ({ ...f, slug: e.target.value }));
                  }}
                />
              </label>
              <label className="text-xs text-parchment/60">
                Category
                <select
                  className={cn(field, "mt-1")}
                  value={form.category}
                  onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                >
                  {PRODUCT_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-xs text-parchment/60">
                Price INR
                <input
                  type="number"
                  min={0}
                  className={cn(field, "mt-1")}
                  value={form.priceInr}
                  onChange={(e) => setForm((f) => ({ ...f, priceInr: Number(e.target.value) }))}
                />
              </label>
              <label className="text-xs text-parchment/60">
                Compare at
                <input
                  type="number"
                  min={0}
                  className={cn(field, "mt-1")}
                  value={form.compareAt}
                  onChange={(e) => setForm((f) => ({ ...f, compareAt: e.target.value }))}
                />
              </label>
              <label className="text-xs text-parchment/60">
                Stock
                <input
                  type="number"
                  min={0}
                  className={cn(field, "mt-1")}
                  value={form.stock}
                  onChange={(e) => setForm((f) => ({ ...f, stock: Number(e.target.value) }))}
                />
              </label>
              <label className="text-xs text-parchment/60 sm:col-span-2">
                Photographs — up to 5, laid on ivory
                <div className="mt-2 grid grid-cols-5 gap-2">
                  {Array.from({ length: MAX_SHOTS }).map((_, n) => {
                    const src = form.gallery[n];
                    return (
                      <div
                        key={n}
                        className="relative overflow-hidden rounded-xl border border-white/10 bg-ivory"
                      >
                        {src ? (
                          <ProductPhoto src={src} alt="" rounded="rounded-none" className="aspect-square" />
                        ) : (
                          <div className="grid aspect-square place-items-center px-1 text-center text-[10px] text-ink-muted">
                            {n === 0 ? "Cover" : `${n + 1}`}
                          </div>
                        )}
                        {src ? (
                          <button
                            type="button"
                            className="absolute top-1 right-1 rounded bg-ink/70 px-1.5 text-[10px] text-parchment"
                            onClick={() =>
                              setForm((f) => {
                                const gallery = f.gallery.filter((_, i) => i !== n);
                                return { ...f, gallery, imagePath: gallery[0] || "/images/ruby.jpg" };
                              })
                            }
                          >
                            ×
                          </button>
                        ) : null}
                        {n === 0 && src ? (
                          <span className="absolute bottom-1 left-1 rounded bg-bronze px-1 text-[9px] tracking-wide text-ink uppercase">
                            Cover
                          </span>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  className="mt-2 block w-full text-xs text-parchment/70 file:mr-3 file:rounded-lg file:border-0 file:bg-bronze file:px-3 file:py-1.5 file:text-ink"
                  disabled={uploading || form.gallery.length >= MAX_SHOTS}
                  onChange={(e) => {
                    void onPhotos(e.target.files);
                    e.target.value = "";
                  }}
                />
                {uploading ? <p className="mt-1 text-xs text-bronze">Laying stones on ivory…</p> : null}
                {uploadError ? <p className="mt-1 text-xs text-red-300">{uploadError}</p> : null}
                <p className="mt-1 text-[11px] text-parchment/45">
                  Choose 4–5 photographs at once. First is the cover on the shop.
                </p>
              </label>
              <label className="text-xs text-parchment/60">
                Badge
                <input
                  className={cn(field, "mt-1")}
                  value={form.badge}
                  onChange={(e) => setForm((f) => ({ ...f, badge: e.target.value }))}
                />
              </label>
              <label className="flex items-center gap-2 text-sm text-parchment/80">
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))}
                />
                Active
              </label>
              <label className="text-xs text-parchment/60 sm:col-span-2">
                Description
                <textarea
                  className="mt-1 min-h-24 w-full rounded-lg border border-white/12 bg-black/30 p-3 text-sm text-parchment outline-none"
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                />
              </label>
            </div>
            <div className="flex items-center justify-between gap-2 border-t border-white/8 bg-[#0f1c18] px-5 py-4">
              {editId ? (
                <button
                  type="button"
                  className="text-sm text-red-300"
                  onClick={async () => {
                    if (!confirm("Remove this product?")) return;
                    try {
                      await ownerDeleteProduct({ data: { id: editId } });
                      setOpen(false);
                      load();
                    } catch (err) {
                      setSaveError(err instanceof Error ? err.message : "Could not delete.");
                    }
                  }}
                >
                  Delete
                </button>
              ) : (
                <span />
              )}
              <div className="flex items-center gap-3">
                {saveError ? <p className="max-w-[14rem] text-xs text-red-300">{saveError}</p> : null}
                <Button
                  type="submit"
                  disabled={saving || uploading}
                  className="bg-bronze text-ink hover:bg-bronze-soft"
                >
                  {saving ? "Saving…" : "Save"}
                </Button>
              </div>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}
