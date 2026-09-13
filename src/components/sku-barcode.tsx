import { useMemo } from "react";
import { code128Svg } from "@/lib/barcode";
import { cn } from "@/lib/utils";

export function SkuBarcode({
  value,
  height = 52,
  className,
}: {
  value: string;
  height?: number;
  className?: string;
}) {
  const html = useMemo(() => code128Svg(value, { height, module: 2 }), [value, height]);
  if (!html) return null;
  return (
    <div
      className={cn("inline-flex bg-white p-1", className)}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
