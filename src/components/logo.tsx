import { cn } from "@/lib/utils";

/** Official Sadhguru Gems & Jewellers lockup. */
export function Wordmark({
  className,
  inverted: _inverted = false,
}: {
  className?: string;
  inverted?: boolean;
}) {
  return (
    <picture>
      <source srcSet="/images/logo.webp" type="image/webp" />
      <img
        src="/images/logo.png"
        alt="Sadhguru Gems & Jewellers"
        className={cn(
          "brand-logo h-11 w-auto max-w-[min(200px,58vw)] object-contain object-left sm:h-12 sm:max-w-[236px]",
          className,
        )}
      />
    </picture>
  );
}

export function BrandMark({ className }: { className?: string }) {
  return (
    <img
      src="/images/logo-mark.png"
      alt=""
      className={cn("brand-logo size-10 rounded-[10px] object-cover", className)}
    />
  );
}
