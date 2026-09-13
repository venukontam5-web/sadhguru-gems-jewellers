import { createFileRoute } from "@tanstack/react-router";
import { Printer } from "lucide-react";
import { GST_STATES, HOME_STATE, HSN_RATES, splitGst } from "@/data/gst-chart";
import { Button } from "@/components/ui/button";
import { SITE } from "@/data/site";

export const Route = createFileRoute("/owner/gst")({
  component: GstChart,
});

function GstChart() {
  return (
    <div>
      <div className="print-hidden flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[10px] tracking-[0.2em] text-bronze uppercase">Counter</p>
          <h1 className="font-display text-4xl font-semibold">Statewise GST rate chart</h1>
          <p className="mt-2 max-w-xl text-sm text-parchment/60">
            The house is in {HOME_STATE.name} (code {HOME_STATE.code}). A Solapur customer is CGST +
            SGST. A customer whose GSTIN starts with another state is IGST. Confirm with your
            accountant if the council changes a rate.
          </p>
        </div>
        <Button type="button" className="bg-bronze text-ink hover:bg-bronze-soft" onClick={() => window.print()}>
          <Printer className="size-4" />
          Print chart
        </Button>
      </div>

      <div className="mt-8 hidden print:block">
        <p className="text-xs tracking-[0.18em] uppercase text-[#8c2f39]">{SITE.name}</p>
        <h1 className="font-display text-3xl">GST rate chart · {HOME_STATE.name}</h1>
      </div>

      <h2 className="mt-8 font-display text-2xl">What we sell</h2>
      <div className="mt-4 overflow-x-auto rounded-2xl border border-white/8">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="text-xs tracking-wide text-parchment/50 uppercase print:text-[#5c5148]">
            <tr>
              <th className="px-4 py-3 font-medium">HSN / SAC</th>
              <th className="px-4 py-3 font-medium">Goods</th>
              <th className="px-4 py-3 font-medium">Rate</th>
              <th className="px-4 py-3 font-medium">In Maharashtra</th>
              <th className="px-4 py-3 font-medium">Other states</th>
            </tr>
          </thead>
          <tbody>
            {HSN_RATES.map((r) => {
              const inMh = splitGst(r.rate, true);
              const out = splitGst(r.rate, false);
              return (
                <tr key={r.hsn} className="border-t border-white/8 print:border-[#e6dccb]">
                  <td className="px-4 py-3 font-mono">{r.hsn}</td>
                  <td className="px-4 py-3">
                    <span className="block">{r.name}</span>
                    <span className="text-xs text-parchment/50 print:text-[#5c5148]">{r.note}</span>
                  </td>
                  <td className="px-4 py-3">{r.rate}%</td>
                  <td className="px-4 py-3 text-parchment/80 print:text-[#1a1410]">{inMh.label}</td>
                  <td className="px-4 py-3 text-parchment/80 print:text-[#1a1410]">{out.label}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <h2 className="mt-10 font-display text-2xl">Place of supply</h2>
      <p className="mt-2 max-w-2xl text-sm text-parchment/60 print:text-[#5c5148]">
        Read the first two digits of the customer’s GSTIN. If they match {HOME_STATE.code}, split
        the rate. If they do not, charge IGST. Unregistered walk-ins in Solapur are treated as
        Maharashtra.
      </p>
      <div className="mt-4 overflow-x-auto rounded-2xl border border-white/8">
        <table className="w-full min-w-[520px] text-left text-sm">
          <thead className="text-xs tracking-wide text-parchment/50 uppercase print:text-[#5c5148]">
            <tr>
              <th className="px-4 py-3 font-medium">Code</th>
              <th className="px-4 py-3 font-medium">State / UT</th>
              <th className="px-4 py-3 font-medium">Levy</th>
              <th className="px-4 py-3 font-medium">Jewellery 3%</th>
            </tr>
          </thead>
          <tbody>
            {GST_STATES.map((s) => {
              const split = splitGst(3, s.intra);
              return (
                <tr
                  key={s.code}
                  className={
                    s.intra
                      ? "border-t border-white/8 bg-bronze/10 print:bg-[#fffbf4]"
                      : "border-t border-white/8"
                  }
                >
                  <td className="px-4 py-3 font-mono">{s.code}</td>
                  <td className="px-4 py-3">
                    {s.name}
                    {s.intra ? " · home" : ""}
                  </td>
                  <td className="px-4 py-3">{s.intra ? "CGST + SGST" : "IGST"}</td>
                  <td className="px-4 py-3">{split.label}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
