import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { cartCount, cartTotal, readCart, upsertLine, writeCart, type CartLine } from "@/lib/cart";

type CartCtx = {
  lines: CartLine[];
  count: number;
  total: number;
  add: (line: Omit<CartLine, "qty"> & { qty?: number }) => void;
  setQty: (productId: number, qty: number) => void;
  remove: (productId: number) => void;
  clear: () => void;
};

const Ctx = createContext<CartCtx | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setLines(readCart());
    setReady(true);
  }, []);
  useEffect(() => {
    if (ready) writeCart(lines);
  }, [lines, ready]);

  const add = useCallback((line: Omit<CartLine, "qty"> & { qty?: number }) => {
    setLines((cur) => upsertLine(cur, line));
  }, []);
  const setQty = useCallback((productId: number, qty: number) => {
    setLines((cur) =>
      qty <= 0 ? cur.filter((l) => l.productId !== productId) : cur.map((l) => (l.productId === productId ? { ...l, qty } : l)),
    );
  }, []);
  const remove = useCallback((productId: number) => {
    setLines((cur) => cur.filter((l) => l.productId !== productId));
  }, []);
  const clear = useCallback(() => setLines([]), []);

  const value = useMemo(
    () => ({ lines, count: cartCount(lines), total: cartTotal(lines), add, setQty, remove, clear }),
    [lines, add, setQty, remove, clear],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCart() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("Cart is not open.");
  return ctx;
}

export function useCartOptional() {
  return useContext(Ctx);
}
