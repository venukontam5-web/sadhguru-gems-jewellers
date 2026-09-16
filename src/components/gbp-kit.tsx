import { GBP } from "@/data/gbp";

function CopyBlock({ label, text }: { label: string; text: string }) {
  return (
    <div className="rounded-xl border border-ink/10 bg-ivory p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[10px] tracking-[0.16em] text-bronze uppercase">{label}</p>
        <button
          type="button"
          className="text-xs text-garnet hover:text-garnet-deep"
          onClick={() => void navigator.clipboard.writeText(text)}
        >
          Copy
        </button>
      </div>
      <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-ink">{text}</p>
    </div>
  );
}

export function GbpKit() {
  return (
    <div className="mt-8 space-y-4 rounded-2xl border border-ink/10 bg-white p-5">
      <p className="text-[10px] tracking-[0.2em] text-bronze uppercase">Google Business Profile</p>
      <h2 className="font-display text-2xl">Optimise the Solapur pin</h2>
      <p className="text-sm leading-relaxed text-ink-muted">
        Claim the existing listing. Do not create a second shop. Paste these fields, then add photos.
        Open{" "}
        <a className="text-garnet underline-offset-4 hover:underline" href="https://business.google.com" target="_blank" rel="noreferrer">
          business.google.com
        </a>
        .
      </p>
      <CopyBlock label="Business name" text={GBP.name} />
      <CopyBlock label="Primary category" text={GBP.primaryCategory} />
      <CopyBlock label="Extra categories" text={GBP.extraCategories.join(", ")} />
      <CopyBlock label="Phone" text={GBP.phone} />
      <CopyBlock label="Website (replace sgj.world)" text={GBP.website} />
      <CopyBlock label="Address" text={GBP.address} />
      <CopyBlock label="Hours" text={GBP.hours} />
      <CopyBlock label="From the business (750)" text={GBP.fromTheBusiness} />
      <CopyBlock label="Services" text={GBP.services.join("\n")} />
      {GBP.products.map((p) => (
        <CopyBlock key={p.name} label={`Product · ${p.name}`} text={`${p.name}\n${p.body}`} />
      ))}
      {GBP.qa.map((item) => (
        <CopyBlock key={item.q} label="Q&A" text={`Q: ${item.q}\nA: ${item.a}`} />
      ))}
      {GBP.weeklyPosts.map((post, i) => (
        <CopyBlock key={post} label={`Weekly Google post ${i + 1}`} text={post} />
      ))}
      <div className="rounded-xl border border-ink/10 bg-ivory p-3">
        <p className="text-[10px] tracking-[0.16em] text-bronze uppercase">Photos to upload</p>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-ink">
          {GBP.photoShots.map((shot) => (
            <li key={shot}>{shot}</li>
          ))}
        </ul>
      </div>
      <p className="text-sm text-ink-muted">
        After each sale, ask for a Google review. Replies to reviews: thank them, name the stone, invite them back. Never buy reviews.
      </p>
    </div>
  );
}
