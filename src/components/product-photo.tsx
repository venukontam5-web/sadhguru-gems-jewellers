import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export function webpFor(src: string) {
  const q = src.indexOf("?");
  const path = q >= 0 ? src.slice(0, q) : src;
  const qs = q >= 0 ? src.slice(q) : "";
  if (!/^\/images\/.+\.(jpe?g|png)$/i.test(path)) return null;
  return path.replace(/\.(jpe?g|png)$/i, ".webp") + qs;
}

export function MediaImg({
  src,
  alt,
  className,
  priority = false,
  sizes,
  width,
  height,
}: {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  sizes?: string;
  width?: number;
  height?: number;
}) {
  const webp = webpFor(src);
  const img = (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      sizes={sizes}
      className={className}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      fetchPriority={priority ? "high" : "low"}
    />
  );
  if (!webp) return img;
  return (
    <picture>
      <source type="image/webp" srcSet={webp} sizes={sizes} />
      {img}
    </picture>
  );
}

export function ProductPhoto({
  src,
  alt,
  className,
  imgClassName,
  rounded = "rounded-[22px]",
  priority = false,
  sizes = "(max-width: 640px) 92vw, (max-width: 1024px) 45vw, 380px",
}: {
  src: string;
  alt: string;
  className?: string;
  imgClassName?: string;
  rounded?: string;
  priority?: boolean;
  sizes?: string;
}) {
  return (
    <div className={cn("product-photo relative overflow-hidden bg-ivory", rounded, className)}>
      <MediaImg
        src={src}
        alt={alt}
        className={cn("product-shot size-full object-contain", imgClassName)}
        priority={priority}
        sizes={sizes}
      />
    </div>
  );
}

/** Video file is not requested until the frame is near the screen. */
export function LazyVideo({
  src,
  poster,
  className,
  autoPlayOnView = false,
  muted = true,
  loop = false,
  playsInline = true,
  controls = false,
  onError,
}: {
  src: string;
  poster?: string;
  className?: string;
  autoPlayOnView?: boolean;
  muted?: boolean;
  loop?: boolean;
  playsInline?: boolean;
  controls?: boolean;
  onError?: () => void;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const [near, setNear] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) setNear(true);
        else el.pause();
      },
      { rootMargin: "280px 0px", threshold: 0.01 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el || !near || !autoPlayOnView) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const play = () => void el.play().catch(() => undefined);
    el.addEventListener("loadeddata", play);
    play();
    return () => el.removeEventListener("loadeddata", play);
  }, [near, autoPlayOnView, src]);

  return (
    <video
      ref={ref}
      src={near ? src : undefined}
      poster={poster}
      preload="none"
      muted={muted}
      loop={loop}
      playsInline={playsInline}
      controls={controls}
      className={className}
      onError={onError}
    />
  );
}
