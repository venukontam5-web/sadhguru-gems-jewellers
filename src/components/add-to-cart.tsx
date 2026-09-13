import { useState } from "react";
import { useCart } from "@/lib/cart-store";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function AddToCartButton({
  product,
  className,
  size = "md",
}: {
  product: { id: number; slug: string; name: string; priceInr: number; imagePath: string; stock?: number };
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const cart = useCart();
  const [flash, setFlash] = useState(false);
  const out = (product.stock ?? 1) <= 0;

  return (
    <Button
      type="button"
      size={size}
      disabled={out}
      className={cn(className)}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (out) return;
        cart.add({
          productId: product.id,
          slug: product.slug,
          name: product.name,
          priceInr: product.priceInr,
          imagePath: product.imagePath,
        });
        setFlash(true);
        window.setTimeout(() => setFlash(false), 1400);
      }}
    >
      {out ? "Spoken for" : flash ? "In the bag" : "Add to cart"}
    </Button>
  );
}
