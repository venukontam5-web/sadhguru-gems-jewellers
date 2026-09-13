import { Link } from "@tanstack/react-router";
import type { Gemstone } from "@/data/gemstones";
import type { MetalProduct } from "@/data/products";
import { ProductPhoto } from "@/components/product-photo";

export function GemCard({ gem }: { gem: Gemstone }) {
  return (
    <Link
      to="/gemstones/$slug"
      params={{ slug: gem.slug }}
      className="group flex flex-col overflow-hidden rounded-[22px] bg-ivory shadow-card transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5"
    >
      <ProductPhoto
        src={gem.image}
        alt={gem.name}
        rounded="rounded-none"
        className="aspect-square"
        imgClassName="transition-transform duration-500 group-hover:scale-[1.03]"
      />
      <div className="flex flex-1 flex-col p-5">
        <p className="text-[11px] font-medium tracking-[0.18em] text-garnet uppercase">
          {gem.sanskrit} · {gem.planet}
        </p>
        <h3 className="mt-1.5 font-display text-2xl font-semibold text-ink">{gem.name}</h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-muted">{gem.excerpt}</p>
        <p className="mt-4 text-xs tracking-wide text-stone">
          {gem.group === "navratna" ? "Navratna" : "Cabinet stone"} · {gem.color}
        </p>
      </div>
    </Link>
  );
}

export function MetalCard({
  item,
  to,
}: {
  item: MetalProduct;
  to: "/brass" | "/copper";
}) {
  return (
    <article className="flex flex-col overflow-hidden rounded-[22px] bg-ivory shadow-card">
      <ProductPhoto src={item.image} alt={item.name} rounded="rounded-none" className="aspect-[4/3]" />
      <div className="flex flex-1 flex-col p-5">
        <p className="text-[11px] font-medium tracking-[0.18em] text-garnet uppercase">
          {item.category}
        </p>
        <h3 className="mt-1.5 font-display text-2xl font-semibold text-ink">{item.name}</h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-muted">{item.excerpt}</p>
        <p className="mt-4 text-xs text-stone">{item.priceNote}</p>
        <Link
          to={to}
          hash={item.slug}
          className="mt-4 text-sm font-medium text-garnet hover:text-garnet-deep"
        >
          View in collection
        </Link>
      </div>
    </article>
  );
}
