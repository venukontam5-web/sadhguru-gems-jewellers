import { useEffect, useState } from "react";
import { listActiveSlides } from "@/server/catalogue";
import type { ShopSlide } from "@/lib/shop";
import { MediaImg } from "@/components/product-photo";

export function StoryRail() {
  const [slides, setSlides] = useState<ShopSlide[]>([]);
  useEffect(() => {
    void listActiveSlides({ data: { kind: "story" } }).then(setSlides);
  }, []);
  if (!slides.length) return null;
  return (
    <div className="border-b border-white/8">
      <div className="mx-auto flex max-w-6xl gap-4 overflow-x-auto px-4 py-4 sm:px-6">
        {slides.map((s) => (
          <a key={s.id} href={s.link} className="hero-slot w-[88px] shrink-0 text-center">
            <MediaImg
              src={s.imagePath}
              alt=""
              className="hero-media aspect-[3/4] w-full rounded-2xl object-cover ring-1 ring-bronze/40"
              sizes="88px"
            />
            <span className="blend-kicker mt-2 block truncate text-[11px] tracking-wide uppercase">
              {s.kicker || s.title}
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}
