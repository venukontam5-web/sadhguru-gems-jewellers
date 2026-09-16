import { useState } from "react";
import { ProductPhoto } from "@/components/product-photo";
import { cn } from "@/lib/utils";

export function ProductGallery({
  images,
  alt,
  className,
}: {
  images: string[];
  alt: string;
  className?: string;
}) {
  const shots = images.filter(Boolean).slice(0, 5);
  const [i, setI] = useState(0);
  const current = shots[i] || shots[0];
  if (!current) return null;

  return (
    <div className={className}>
      <ProductPhoto
        src={current}
        alt={alt}
        rounded="rounded-[28px]"
        className="aspect-square w-full shadow-card"
        priority
        sizes="(max-width: 1024px) 92vw, 560px"
      />
      {shots.length > 1 ? (
        <ul className="mt-3 grid grid-cols-5 gap-2">
          {shots.map((src, n) => (
            <li key={src + n}>
              <button
                type="button"
                onClick={() => setI(n)}
                className={cn(
                  "block w-full overflow-hidden rounded-xl bg-ivory ring-2 ring-offset-2 ring-offset-parchment",
                  n === i ? "ring-bronze" : "ring-transparent",
                )}
                aria-label={`Photograph ${n + 1}`}
              >
                <ProductPhoto src={src} alt="" rounded="rounded-none" className="aspect-square" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
