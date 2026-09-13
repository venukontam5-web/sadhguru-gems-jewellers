import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BadgeCheck,
  Crown,
  Gem,
  Leaf,
  Play,
  Sparkles,
  Truck,
  Users,
  Volume2,
  X,
} from "lucide-react";
import { listActiveSlides } from "@/server/catalogue";
import { buttonVariants } from "@/components/ui/button";
import { SITE } from "@/data/site";
import type { ShopSlide } from "@/lib/shop";
import { youtubeEmbed, youtubeId } from "@/lib/slides";
import { cn } from "@/lib/utils";
import { MediaImg, LazyVideo } from "@/components/product-photo";

export function HomeHero() {
  const [slides, setSlides] = useState<ShopSlide[]>([]);
  useEffect(() => {
    void listActiveSlides({ data: {} }).then((rows) =>
      setSlides(rows.filter((s) => s.kind === "poster" || s.kind === "video")),
    );
  }, []);
  const posters = slides.filter((s) => s.kind === "poster").slice(0, 2);
  const videos = slides.filter((s) => s.kind === "video").slice(0, 3);

  return (
    <>
      <section className="relative overflow-hidden bg-ivory">
        <MediaImg
          src="/images/ivory-flora.jpg"
          alt=""
          className="hero-media pointer-events-none absolute inset-0 size-full object-cover opacity-45"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-ivory via-ivory/88 to-ivory/40" />

        <div className="relative mx-auto grid max-w-6xl items-center gap-8 px-4 pt-10 pb-6 sm:px-6 lg:grid-cols-2 lg:gap-12 lg:pt-14 lg:pb-8">
          <div>
            <p className="text-xs font-medium tracking-[0.22em] text-garnet uppercase">
              Certified gemstones & jewellery
            </p>
            <h1 className="mt-4 font-display text-5xl font-semibold leading-[1.05] text-ink sm:text-6xl md:text-[4.25rem]">
              Pure Stones
              <span className="mt-1 block text-bronze">Brighter Lives</span>
            </h1>
            <p className="mt-5 max-w-md text-base leading-relaxed text-ink-muted sm:text-lg">
              Natural. Certified. Hand-Finished.
              <span className="mt-2 block">
                Bringing positivity, prosperity and timeless beauty to your life.
              </span>
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/shop" className={cn(buttonVariants({ size: "lg" }))}>
                Shop the cabinet
                <ArrowRight className="size-4" />
              </Link>
              <Link
                to="/contact"
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "border-garnet/35 bg-ivory/80",
                )}
              >
                Visit the shop
              </Link>
            </div>
            <ul className="mt-8 grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-4">
              {[
                { icon: BadgeCheck, t: "100% Certified" },
                { icon: Leaf, t: "Natural gemstones" },
                { icon: Truck, t: "Secure shipping" },
                { icon: Users, t: `Trusted since ${SITE.established}` },
              ].map((s) => (
                <li key={s.t} className="flex items-center gap-2 text-xs text-ink-muted">
                  <s.icon className="size-4 shrink-0 text-bronze" />
                  <span>{s.t}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="relative">
            <MediaImg
              src="/images/hero-ring.jpg"
              alt="Emerald halo ring in gold"
              className="hero-media aspect-[4/3] w-full rounded-[28px] object-cover shadow-card"
              priority
              width={1280}
              height={960}
              sizes="(max-width: 1024px) 92vw, 560px"
            />
            <div className="pointer-events-none absolute top-4 right-4 hidden text-right sm:block lg:top-8 lg:right-2">
              <p className="font-display text-2xl italic leading-tight text-ink/80">
                More Than
                <br />
                Jewellery
              </p>
              <p className="mt-3 text-[10px] tracking-[0.2em] text-stone uppercase">
                A blessing for life
              </p>
            </div>
          </div>
        </div>

        <div className="relative mx-auto max-w-6xl px-4 pb-12 sm:px-6">
          {posters.length ? <PosterRow slides={posters} /> : null}
          {videos.length ? <VideoRow slides={videos} /> : null}
        </div>
      </section>

      <section className="relative overflow-hidden border-y border-line bg-ivory">
        <MediaImg
          src="/images/ivory-flora.jpg"
          alt=""
          className="hero-media pointer-events-none absolute inset-0 size-full object-cover opacity-30"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-ivory/70" />
        <div className="relative mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 sm:py-20">
          <p className="text-xs font-medium tracking-[0.22em] text-garnet uppercase">
            Solapur · Est. {SITE.established}
          </p>
          <h2 className="mt-4 font-display text-4xl font-semibold leading-[1.12] text-ink sm:text-5xl">
            Trusted Stones
            <span className="mt-1 block text-bronze">for a Brighter Tomorrow.</span>
          </h2>
          <p className="mx-auto mt-5 max-w-lg text-sm leading-relaxed text-ink-muted sm:text-base">
            Certified gemstones, gold and silver jewellery, and hand-finished brass and copper —
            from a cabinet on Akkalkot Road.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/gemstones" className={cn(buttonVariants({ size: "lg" }))}>
              Explore gemstones
              <ArrowRight className="size-4" />
            </Link>
            <Link
              to="/contact"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "border-garnet/35 bg-ivory/80",
              )}
            >
              Visit our store
            </Link>
          </div>
          <p className="mt-8 font-display text-xl italic text-ink/70">
            Good stones, brighter tomorrows.
          </p>
        </div>
        <div className="relative mx-auto grid max-w-6xl grid-cols-2 gap-px border-t border-line sm:grid-cols-5">
          {[
            { icon: Leaf, t: "Authentic & natural" },
            { icon: Gem, t: "Certified stones" },
            { icon: Sparkles, t: "Positive energy" },
            { icon: Crown, t: "Premium quality" },
            { icon: Users, t: "Happy customers" },
          ].map((s) => (
            <div key={s.t} className="flex flex-col items-center gap-2 bg-ivory/80 px-3 py-7 text-center">
              <s.icon className="size-6 text-bronze" />
              <p className="text-xs font-medium text-ink">{s.t}</p>
            </div>
          ))}
        </div>
        <p className="relative py-4 text-center text-[10px] tracking-[0.22em] text-stone uppercase">
          Tradition · Trust · Timeless beauty
        </p>
      </section>
    </>
  );
}

function PosterRow({ slides }: { slides: ShopSlide[] }) {
  const scroller = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || slides.length < 2) return;
    const el = scroller.current;
    if (!el) return;
    const tick = window.setInterval(() => {
      if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 12) {
        el.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        el.scrollBy({ left: el.clientWidth * 0.82, behavior: "smooth" });
      }
    }, 5200);
    return () => window.clearInterval(tick);
  }, [slides.length]);

  return (
    <div
      ref={scroller}
      className="hero-slot-scroll flex snap-x snap-mandatory gap-3 overflow-x-auto pb-1 sm:grid sm:grid-cols-2 sm:overflow-visible"
      aria-label="Campaign posters"
    >
      {slides.map((s) => (
        <a
          key={s.id}
          href={s.link || "/shop"}
          className="hero-slot relative w-[86%] shrink-0 snap-start overflow-hidden rounded-[18px] bg-ink sm:w-auto"
        >
          <MediaImg src={s.imagePath} alt="" className="hero-media aspect-[16/9] w-full object-cover" sizes="(max-width: 640px) 86vw, 50vw" />
          <span className="absolute inset-0 bg-gradient-to-t from-ink/75 via-transparent to-ink/10" />
          <span className="absolute top-3 left-3 grid size-9 place-items-center rounded-full bg-ink/45 text-parchment ring-1 ring-white/25">
            <Play className="size-3.5 fill-current" />
          </span>
          <span className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 px-4 py-3">
            <span>
              <span className="block text-[10px] tracking-[0.18em] text-bronze-soft uppercase">
                {s.kicker}
              </span>
              <span className="block font-display text-lg leading-tight text-parchment">{s.title}</span>
            </span>
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-ivory text-ink">
              <ArrowRight className="size-4" />
            </span>
          </span>
        </a>
      ))}
    </div>
  );
}

function VideoRow({ slides }: { slides: ShopSlide[] }) {
  const [open, setOpen] = useState<ShopSlide | null>(null);

  return (
    <>
      <div
        className="hero-slot-scroll mt-3 flex snap-x snap-mandatory gap-3 overflow-x-auto pb-1 sm:grid sm:grid-cols-3 sm:overflow-visible"
        aria-label="Product videos"
      >
        {slides.map((s) => (
          <VideoCard key={s.id} slide={s} onOpen={() => setOpen(s)} />
        ))}
      </div>
      {open ? <VideoLightbox slide={open} onClose={() => setOpen(null)} /> : null}
    </>
  );
}

function VideoCard({ slide, onOpen }: { slide: ShopSlide; onOpen: () => void }) {
  const [broken, setBroken] = useState(false);
  const yt = slide.mediaType === "youtube" ? youtubeId(slide.videoPath) : null;
  const hasFile = slide.mediaType === "video" && slide.videoPath && !broken;

  return (
    <button
      type="button"
      onClick={onOpen}
      className="hero-slot relative w-[72%] min-w-[180px] shrink-0 snap-start overflow-hidden rounded-[18px] bg-ink text-left sm:w-auto sm:min-w-0"
    >
      {hasFile ? (
        <LazyVideo
          src={slide.videoPath}
          poster={slide.imagePath}
          autoPlayOnView
          loop
          className="aspect-[16/10] w-full object-cover"
          onError={() => setBroken(true)}
        />
      ) : (
        <MediaImg
          src={slide.imagePath}
          alt=""
          className="hero-media aspect-[16/10] w-full object-cover"
          sizes="(max-width: 640px) 72vw, 33vw"
        />
      )}
      <span className="absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-ink/10" />
      <span className="absolute top-3 left-3 grid size-9 place-items-center rounded-full bg-ink/45 text-parchment ring-1 ring-white/25">
        {yt ? <Volume2 className="size-3.5" /> : <Play className="size-3.5 fill-current" />}
      </span>
      <span className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 px-3 py-3">
        <span className="min-w-0">
          <span className="block truncate text-[10px] tracking-[0.16em] text-bronze-soft uppercase">
            {slide.kicker}
          </span>
          <span className="block truncate font-display text-base leading-tight text-parchment">
            {slide.title}
          </span>
        </span>
        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-ivory text-ink">
          <ArrowRight className="size-3.5" />
        </span>
      </span>
    </button>
  );
}

function VideoLightbox({ slide, onClose }: { slide: ShopSlide; onClose: () => void }) {
  const yt = slide.mediaType === "youtube" ? youtubeId(slide.videoPath) : null;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-ink/88 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={slide.title}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm overflow-hidden rounded-[24px] bg-ink ring-1 ring-bronze/40"
        onClick={(e) => e.stopPropagation()}
      >
        {yt ? (
          <iframe
            title={slide.title}
            src={youtubeEmbed(yt, "autoplay=1")}
            className="aspect-[9/16] w-full"
            allow="autoplay; encrypted-media"
            allowFullScreen
          />
        ) : slide.videoPath && slide.mediaType === "video" ? (
          <video
            src={slide.videoPath}
            poster={slide.imagePath}
            controls
            autoPlay
            playsInline
            className="aspect-[9/16] w-full object-cover"
          />
        ) : (
          <MediaImg src={slide.imagePath} alt="" className="hero-media aspect-[9/16] w-full object-cover" sizes="90vw" />
        )}
        <div className="flex items-center justify-between gap-3 px-4 py-3">
          <div className="min-w-0">
            <p className="truncate font-display text-lg text-parchment">{slide.title}</p>
            <a href={slide.link || "/shop"} className="text-xs text-bronze">
              See this piece
            </a>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid size-10 place-items-center rounded-full border border-white/15 text-parchment"
            aria-label="Close"
          >
            <X className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
