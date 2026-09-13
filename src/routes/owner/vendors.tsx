import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { deleteVendor, listVendors, saveVendor } from "@/server/admin";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";

export const Route = createFileRoute("/owner/vendors")({
  component: OwnerVendors,
});

function OwnerVendors() {
  const [rows, setRows] = useState<Awaited<ReturnType<typeof listVendors>>>([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [notes, setNotes] = useState("");
  const load = useCallback(() => {
    void listVendors().then(setRows);
  }, []);
  useEffect(load, [load]);

  async function onAdd(e: FormEvent) {
    e.preventDefault();
    await saveVendor({ data: { name, phone, city, notes } });
    setName("");
    setPhone("");
    setCity("");
    setNotes("");
    load();
  }

  return (
    <div className="grid gap-10 lg:grid-cols-2">
      <div>
        <p className="text-[10px] tracking-[0.2em] text-bronze uppercase">Cabinet</p>
        <h1 className="font-display text-4xl font-semibold">Vendors</h1>
        <p className="mt-2 text-sm text-parchment/60">
          Cutters, brass houses, pearl lots. Private — visitors never see this book.
        </p>
        <ul className="mt-8 space-y-3">
          {rows.map((v) => (
            <li key={v.id} className="rounded-2xl border border-white/8 bg-white/4 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium">{v.name}</p>
                  <p className="mt-1 text-sm text-parchment/55">
                    {[v.city, v.phone].filter(Boolean).join(" · ") || "—"}
                  </p>
                  {v.notes ? <p className="mt-2 text-sm text-parchment/70">{v.notes}</p> : null}
                </div>
                <button
                  type="button"
                  className="text-xs text-parchment/45 hover:text-parchment"
                  onClick={() => void deleteVendor({ data: { id: v.id } }).then(load)}
                >
                  Remove
                </button>
              </div>
            </li>
          ))}
          {!rows.length ? <p className="text-sm text-parchment/50">No vendors yet.</p> : null}
        </ul>
      </div>
      <form onSubmit={(e) => void onAdd(e)} className="rounded-2xl border border-white/8 bg-white/4 p-5">
        <h2 className="font-display text-2xl">Add a house</h2>
        <div className="mt-4 space-y-3">
          <div>
            <Label htmlFor="vn">Name</Label>
            <Input id="vn" required value={name} onChange={(e) => setName(e.target.value)} className="bg-white/5 text-parchment" />
          </div>
          <div>
            <Label htmlFor="vp">Phone</Label>
            <Input id="vp" value={phone} onChange={(e) => setPhone(e.target.value)} className="bg-white/5 text-parchment" />
          </div>
          <div>
            <Label htmlFor="vc">City</Label>
            <Input id="vc" value={city} onChange={(e) => setCity(e.target.value)} className="bg-white/5 text-parchment" />
          </div>
          <div>
            <Label htmlFor="vo">Notes</Label>
            <Textarea id="vo" value={notes} onChange={(e) => setNotes(e.target.value)} className="bg-white/5 text-parchment" />
          </div>
          <Button type="submit">Save vendor</Button>
        </div>
      </form>
    </div>
  );
}
