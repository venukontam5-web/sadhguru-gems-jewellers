import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { listCategories, saveCategory } from "@/server/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/owner/categories")({
  component: OwnerCategories,
});

function OwnerCategories() {
  const [rows, setRows] = useState<Awaited<ReturnType<typeof listCategories>>>([]);
  const [name, setName] = useState("");
  const load = useCallback(() => {
    void listCategories().then(setRows);
  }, []);
  useEffect(load, [load]);

  async function onAdd(e: FormEvent) {
    e.preventDefault();
    await saveCategory({ data: { name } });
    setName("");
    load();
  }

  return (
    <div className="max-w-xl">
      <p className="text-[10px] tracking-[0.2em] text-bronze uppercase">Catalogue</p>
      <h1 className="font-display text-4xl font-semibold">Categories</h1>
      <p className="mt-2 text-sm text-parchment/60">
        Trays on the shop: gemstones, mala, brass. A name here is what the product form offers.
      </p>
      <ul className="mt-8 divide-y divide-white/8 rounded-2xl border border-white/8">
        {rows.map((c) => (
          <li key={c.id} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
            <span>
              {c.name}
              <span className="ml-2 text-parchment/45">{c.count} pieces</span>
            </span>
            <button
              type="button"
              className="text-xs text-parchment/50 hover:text-parchment"
              onClick={() => void saveCategory({ data: { id: c.id, name: c.name, active: !c.active } }).then(load)}
            >
              {c.active ? "Hide" : "Show"}
            </button>
          </li>
        ))}
      </ul>
      <form onSubmit={(e) => void onAdd(e)} className="mt-6 flex gap-2">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New tray"
          required
          className="bg-white/5 text-parchment"
        />
        <Button type="submit">Add</Button>
      </form>
    </div>
  );
}
