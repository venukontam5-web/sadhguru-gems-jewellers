import type { InputHTMLAttributes, LabelHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-11 w-full rounded-[12px] border border-ink/12 bg-ivory px-3.5 text-base text-ink placeholder:text-stone sm:text-sm",
        "outline-none transition-[box-shadow,border-color] duration-150",
        "focus:border-garnet/40 focus:shadow-[0_0_0_3px_rgb(140_47_57_/0.12)]",
        className,
      )}
      {...props}
    />
  );
}

export function Textarea({
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "min-h-32 w-full rounded-[16px] border border-ink/12 bg-ivory px-3.5 py-3 text-sm text-ink placeholder:text-stone",
        "outline-none transition-[box-shadow,border-color] duration-150",
        "focus:border-garnet/40 focus:shadow-[0_0_0_3px_rgb(140_47_57_/0.12)]",
        className,
      )}
      {...props}
    />
  );
}

export function Label({ className, ...props }: LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn("mb-1.5 block text-xs font-medium tracking-wide text-ink-muted", className)}
      {...props}
    />
  );
}
