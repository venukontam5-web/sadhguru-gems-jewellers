import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { ownerListProducts, ownerSaveProduct } from "@/server/catalogue";
import { inr, type ShopProduct } from "@/lib/shop";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/owner/discounts")({
  component: OwnerDiscounts,
});

function OwnerDiscounts() {
  const [rows, setRows] = useState<ShopProduct[]>([]);
  const load = useCallback(() => {
    void ownerListProducts().then(setRows);
  }, []);
  useEffect(load, [load]);

  const onSale = rows.filter((p) => (p.compareAt != null && p.compareAt > p.priceInr) || /sale|offer|discount/i.test(p.badge));

  async function markSale(p: ShopProduct) {
    const compare = p.compareAt && p.compareAt > p.priceInr ? p.compareAt : Math.round(p.priceInr * 1.2);
    await ownerSaveProduct({
      data: {
        id: p.id,
        slug: p.slug,
        name: p.name,
        category: p.category,
        priceInr: p.priceInr,
        compareAt: compare,
        stock: p.stock,
        imagePath: p.imagePath,
        badge: p.badge || "Offer",
        active: p.active,
        description: p.description,
      },
    });
    load();
  }

  async function clearSale(p: ShopProduct) {
    await ownerSaveProduct({
      data: {
        id: p.id,
        slug: p.slug,
        name: p.name,
        category: p.category,
        priceInr: p.priceInr,
        compareAt: null,
        stock: p.stock,
        imagePath: p.imagePath,
        badge: "",
        active: p.active,
        description: p.description,
      },
    });
    load();
  }

  return (
    <div>
      <p className="text-[10px] tracking-[0.2em] text-bronze uppercase">Shop front</p>
      <h1 className="font-display text-4xl font-semibold">Discounted zone</h1>
      <p className="mt-2 max-w-xl text-sm text-parchment/60">
        Pieces with a compare-at price or an Offer badge. The public shop already shows the strike
        through — this is the tray.
      </p>
      <div className="mt-8 overflow-x-auto rounded-2xl border border-white/8">
        <table className="w-full min-w-[520px] text-left text-sm">
          <thead className="text-xs tracking-wide text-parchment/50 uppercase">
            <tr>
              <th className="px-4 py-3 font-medium">Piece</th>
              <th className="px-4 py-3 font-medium">Now</th>
              <th className="px-4 py-3 font-medium">Was</th>
              <th className="px-4 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {onSale.map((p) => (
              <tr key={p.id} className="border-t border-white/8">
                <td className="px-4 py-3">
                  {p.name}
                  {p.badge ? <span className="ml-2 text-xs text-bronze">{p.badge}</span> : null}
                </td>
                <td className="px-4 py-3 tabular-nums">{inr(p.priceInr)}</td>
                <td className="px-4 py-3 tabular-nums text-parchment/50">
                  {p.compareAt ? inr(p.compareAt) : "—"}
                </td>
                <td className="px-4 py-3 text-right">
                  <button type="button" className="text-xs text-parchment/50 hover:text-parchment" onClick={() => void clearSale(p)}>
                    Clear
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!onSale.length ? (
          <p className="px-4 py-10 text-center text-sm text-parchment/50">No offers on the tray yet.</p>
        ) : null}
      </div>
      <div className="mt-8">
        <p className="text-xs tracking-wide text-parchment/45 uppercase">From the cabinet</p>
        <ul className="mt-3 space-y-2">
          {rows
            .filter((p) => p.active && !onSale.includes(p))
            .slice(0, 8)
            .map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-3 text-sm">
                <span>
                  {p.name} <span className="text-parchment/45">{inr(p.priceInr)}</span>
                </span>
                <Button type="button" size="sm" variant="ivory" onClick={() => void markSale(p)}>
                  Put on offer
                </Button>
              </li>
            ))}
        </ul>
      </div>
      <Link to="/owner/products" className="mt-8 inline-block text-sm text-bronze">
        All products →
      </Link>
    </div>
  );
}
