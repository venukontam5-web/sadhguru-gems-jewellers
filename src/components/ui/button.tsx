import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "@radix-ui/react-slot";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 font-medium tracking-wide transition-[background-color,color,transform,box-shadow] duration-150 ease-out active:not-disabled:scale-[0.96] disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-garnet",
  {
    variants: {
      variant: {
        primary: "bg-garnet text-ivory hover:bg-garnet-deep",
        ink: "bg-ink text-parchment hover:bg-ink-soft",
        outline:
          "border border-ink/15 bg-transparent text-ink hover:bg-ink/[0.04]",
        ghost: "text-ink hover:bg-ink/[0.05]",
        ivory: "bg-ivory text-ink hover:bg-parchment",
        gold: "bg-bronze text-ink hover:bg-bronze-soft",
      },
      size: {
        sm: "h-10 rounded-[10px] px-4 text-sm",
        md: "h-11 rounded-[12px] px-5 text-sm",
        lg: "h-12 rounded-[14px] px-6 text-[15px]",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean };

export function Button({
  className,
  variant,
  size,
  asChild,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp className={cn(buttonVariants({ variant, size }), className)} {...props} />
  );
}

export { buttonVariants };
