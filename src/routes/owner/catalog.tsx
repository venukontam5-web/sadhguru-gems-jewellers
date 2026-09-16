import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { ownerListProducts, ownerSaveProduct } from "@/server/catalogue";
import { listCatalogVendors, listCategories, saveVendor } from "@/server/admin";
import { ownerUploadProductImage } from "@/server/media";
import { layOnIvory } from "@/lib/ivory-photo";
import { inr, PRODUCT_CATEGORIES, type ShopProduct } from "@/lib/shop";
import { ProductPhoto } from "@/components/product-photo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/owner/catalog")({
  component: OwnerCatalog,
});

type Draft = {
  key: string;
  imagePath: string;
  name: string;
  details: string;
  price: string;
  stock: string;
  category: string;
};

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function OwnerCatalog() {
  const [rows, setRows] = useState<ShopProduct[]>([]);
  const [vendors, setVendors] = useState<{ id: number; name: string; city: string }[]>([]);
  const [cats, setCats] = useState<string[]>([...PRODUCT_CATEGORIES]);
  const [vendorId, setVendorId] = useState<number | "">("");
  const [tray, setTray] = useState("All");
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [newVendor, setNewVendor] = useState("");

  const load = useCallback(() => {
    void ownerListProducts().then(setRows);
    void listCatalogVendors()
      .then((v) => setVendors(v))
      .catch(() => setVendors([]));
    void listCategories()
      .then((c) => {
        const names = c.filter((x) => x.active).map((x) => x.name);
        const merged = [...PRODUCT_CATEGORIES] as string[];
        for (const n of names) if (!merged.includes(n)) merged.push(n);
        setCats(merged);
      })
      .catch(() => setCats([...PRODUCT_CATEGORIES]));
  }, []);
  useEffect(load, [load]);

  const filtered = rows.filter((p) => {
    if (vendorId !== "" && p.vendorId !== vendorId) return false;
    if (tray !== "All" && p.category !== tray) return false;
    return true;
  });

  const grouped = useMemo(() => {
    const map = new Map<string, ShopProduct[]>();
    for (const p of filtered) {
      const k = p.category || "Cabinet";
      const list = map.get(k) ?? [];
      list.push(p);
      map.set(k, list);
    }
    const order = tray === "All" ? [...cats, ...[...map.keys()].filter((k) => !cats.includes(k))] : [tray];
    return order
      .filter((c) => map.has(c))
      .map((c) => ({ category: c, items: map.get(c)! }));
  }, [filtered, cats, tray]);

  async function onPhotos(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);
    setError(null);
    try {
      const next: Draft[] = [];
      for (const file of Array.from(files)) {
        const ivory = await layOnIvory(file);
        const res = await ownerUploadProductImage({
          data: { filename: ivory.filename, dataUrl: ivory.dataUrl },
        });
        next.push({
          key: `${file.name}-${res.path}`,
          imagePath: res.path,
          name: file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " "),
          details: "",
          price: "",
          stock: "1",
          category: tray === "All" ? cats[0] || "Gemstones" : tray,
        });
      }
      setDrafts((cur) => [...next, ...cur]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "The photographs did not save.");
    } finally {
      setUploading(false);
    }
  }

  async function saveDrafts(e: FormEvent) {
    e.preventDefault();
    if (!drafts.length) return;
    setBusy(true);
    setError(null);
    setNote(null);
    try {
      let n = 0;
      for (const d of drafts) {
        const name = d.name.trim();
        if (!name) continue;
        await ownerSaveProduct({
          data: {
            name,
            slug: slugify(name),
            category: d.category,
            priceInr: Number(d.price) || 0,
            compareAt: null,
            stock: Number(d.stock) || 0,
            imagePath: d.imagePath,
            badge: "",
            active: true,
            description: d.details.trim(),
            vendorId: vendorId === "" ? null : vendorId,
          },
        });
        n += 1;
      }
      setDrafts([]);
      setNote(`${n} piece${n === 1 ? "" : "s"} in the album.`);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "The list did not save.");
    } finally {
      setBusy(false);
    }
  }

  async function addVendor(e: FormEvent) {
    e.preventDefault();
    const name = newVendor.trim();
    if (!name) return;
    try {
      await saveVendor({ data: { name, phone: "", city: "", notes: "" } });
      setNewVendor("");
      const v = await listCatalogVendors();
      setVendors(v);
      const hit = v.find((x) => x.name.toLowerCase() === name.toLowerCase());
      if (hit) setVendorId(hit.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Vendor did not save.");
    }
  }

  const field =
    "h-10 w-full rounded-lg border border-white/12 bg-black/30 px-3 text-sm text-parchment outline-none focus:border-bronze";

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[10px] tracking-[0.2em] text-bronze uppercase">Catalogue</p>
          <h1 className="font-display text-4xl font-semibold">Album catalog</h1>
          <p className="mt-1 max-w-xl text-sm text-parchment/60">
            Upload a vendor’s product list — photograph, details, category. Grouped like an album.
            Shoppers see the piece only after it is saved.
          </p>
        </div>
        <Link to="/owner/products" className="text-sm text-bronze hover:text-bronze-soft">
          Table view
        </Link>
      </div>

      <div className="mt-6 grid gap-3 rounded-2xl border border-white/8 bg-white/4 p-4 sm:grid-cols-2 lg:grid-cols-4">
        <label className="text-xs text-parchment/60">
          Vendor
          <select
            className={cn(field, "mt-1")}
            value={vendorId}
            onChange={(e) => setVendorId(e.target.value ? Number(e.target.value) : "")}
          >
            <option value="">House stock (no vendor)</option>
            {vendors.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name}
                {v.city ? ` · ${v.city}` : ""}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs text-parchment/60">
          Category tray
          <select className={cn(field, "mt-1")} value={tray} onChange={(e) => setTray(e.target.value)}>
            <option value="All">All categories</option>
            {cats.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <form onSubmit={(e) => void addVendor(e)} className="flex items-end gap-2">
          <label className="min-w-0 flex-1 text-xs text-parchment/60">
            New vendor
            <Input
              value={newVendor}
              onChange={(e) => setNewVendor(e.target.value)}
              placeholder="Cutter / brass house"
              className="mt-1 bg-white/5 text-parchment"
            />
          </label>
          <Button type="submit" variant="ivory" className="border border-white/15 bg-transparent text-parchment">
            Add
          </Button>
        </form>
        <label className="flex cursor-pointer flex-col justify-end text-xs text-parchment/60">
          <span>{uploading ? "Laying on ivory…" : "Upload photographs"}</span>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            className="mt-1 text-sm"
            disabled={uploading}
            onChange={(e) => {
              void onPhotos(e.target.files);
              e.target.value = "";
            }}
          />
        </label>
      </div>

      {drafts.length ? (
        <form onSubmit={(e) => void saveDrafts(e)} className="mt-6 rounded-2xl border border-bronze/30 bg-white/4 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-display text-2xl">New pieces · {drafts.length}</h2>
            <div className="flex gap-2">
              <Button type="button" variant="ivory" className="border border-white/15 bg-transparent text-parchment" onClick={() => setDrafts([])}>
                Clear
              </Button>
              <Button type="submit" disabled={busy} className="bg-bronze text-ink hover:bg-bronze-soft">
                {busy ? "Saving…" : "Save to album"}
              </Button>
            </div>
          </div>
          <ul className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {drafts.map((d) => (
              <li key={d.key} className="overflow-hidden rounded-2xl border border-white/10 bg-[#0c1815]">
                <ProductPhoto src={d.imagePath} alt="" rounded="rounded-none" className="aspect-square" />
                <div className="space-y-2 p-3">
                  <input
                    className={field}
                    value={d.name}
                    placeholder="Name"
                    onChange={(e) =>
                      setDrafts((cur) => cur.map((x) => (x.key === d.key ? { ...x, name: e.target.value } : x)))
                    }
                  />
                  <select
                    className={field}
                    value={d.category}
                    onChange={(e) =>
                      setDrafts((cur) => cur.map((x) => (x.key === d.key ? { ...x, category: e.target.value } : x)))
                    }
                  >
                    {cats.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      className={field}
                      inputMode="numeric"
                      placeholder="Price ₹"
                      value={d.price}
                      onChange={(e) =>
                        setDrafts((cur) => cur.map((x) => (x.key === d.key ? { ...x, price: e.target.value } : x)))
                      }
                    />
                    <input
                      className={field}
                      inputMode="numeric"
                      placeholder="Stock"
                      value={d.stock}
                      onChange={(e) =>
                        setDrafts((cur) => cur.map((x) => (x.key === d.key ? { ...x, stock: e.target.value } : x)))
                      }
                    />
                  </div>
                  <textarea
                    className="min-h-16 w-full rounded-lg border border-white/12 bg-black/30 px-3 py-2 text-sm text-parchment outline-none focus:border-bronze"
                    placeholder="Details — cut, origin, certificate"
                    value={d.details}
                    onChange={(e) =>
                      setDrafts((cur) => cur.map((x) => (x.key === d.key ? { ...x, details: e.target.value } : x)))
                    }
                  />
                  <button
                    type="button"
                    className="text-xs text-parchment/45 hover:text-parchment"
                    onClick={() => setDrafts((cur) => cur.filter((x) => x.key !== d.key))}
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </form>
      ) : null}

      {error ? <p className="mt-4 text-sm text-red-300">{error}</p> : null}
      {note ? <p className="mt-4 text-sm text-bronze">{note}</p> : null}

      <div className="mt-4 flex flex-wrap gap-2">
        {["All", ...cats].map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setTray(c)}
            className={cn(
              "rounded-full px-3 py-1.5 text-xs tracking-wide uppercase",
              tray === c ? "bg-bronze text-ink" : "border border-white/12 text-parchment/70",
            )}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="mt-8 space-y-10">
        {grouped.map((g) => (
          <section key={g.category}>
            <h2 className="font-display text-2xl">
              {g.category}
              <span className="ml-2 text-sm font-sans text-parchment/45">{g.items.length}</span>
            </h2>
            <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {g.items.map((p) => (
                <li key={p.id}>
                  <Link
                    to="/owner/products"
                    className="block overflow-hidden rounded-2xl border border-white/8 bg-white/4 hover:border-bronze/40"
                  >
                    <ProductPhoto src={p.imagePath} alt="" rounded="rounded-none" className="aspect-square" />
                    <div className="p-3">
                      <p className="truncate text-sm font-medium">{p.name}</p>
                      <p className="mt-1 text-xs text-parchment/50">
                        {p.vendorName || "House"} · {inr(p.priceInr)}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
        {!grouped.length ? (
          <p className="text-sm text-parchment/50">
            No pieces in this tray yet. Choose a vendor, pick photographs, fill details, Save to album.
          </p>
        ) : null}
      </div>
    </div>
  );
}
