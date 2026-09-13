import { useEffect, useState } from "react";
import { Link, useRouter } from "@tanstack/react-router";
import { Check, RotateCcw } from "lucide-react";
import {
  BODY_FONTS,
  DEFAULT_THEME,
  DISPLAY_FONTS,
  FONT_SIZES,
  THEME_PRESETS,
  type SiteTheme,
} from "@/lib/theme";
import { getPublicTheme, saveSiteTheme } from "@/server/theme";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { DeskTabs } from "@/components/owner-tabs";

function ColorField({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block rounded-2xl border border-white/10 bg-black/20 p-4">
      <span className="flex items-center justify-between gap-2">
        <span>
          <span className="block text-sm font-medium text-parchment">{label}</span>
          <span className="block text-[11px] text-parchment/50">{hint}</span>
        </span>
        <span
          className="size-8 rounded-full border border-white/20"
          style={{ background: value }}
        />
      </span>
      <span className="mt-3 flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-12 w-14 cursor-pointer rounded-xl border border-white/15 bg-transparent p-1"
          aria-label={label}
        />
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-12 flex-1 rounded-xl border border-white/12 bg-black/30 px-3 font-mono text-sm uppercase tracking-wide outline-none focus:border-bronze"
          spellCheck={false}
        />
      </span>
    </label>
  );
}

export function AppearanceEditor({ showHeading = true }: { showHeading?: boolean }) {
  const router = useRouter();
  const [theme, setTheme] = useState<SiteTheme>(DEFAULT_THEME);
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);
  const [pane, setPane] = useState<"themes" | "fonts" | "colours">("themes");

  useEffect(() => {
    void getPublicTheme()
      .then((t) => {
        setTheme(t);
        setDirty(false);
      })
      .catch(() => setTheme(DEFAULT_THEME));
  }, []);

  function patch(partial: Partial<SiteTheme>) {
    setTheme((t) => ({ ...t, ...partial }));
    setSaved(false);
    setDirty(true);
  }

  function pickPreset(id: (typeof THEME_PRESETS)[number]["id"]) {
    const p = THEME_PRESETS.find((x) => x.id === id);
    if (!p) return;
    patch({
      preset: p.id,
      parchment: p.parchment,
      ink: p.ink,
      garnet: p.garnet,
      bronze: p.bronze,
    });
  }

  async function save() {
    setBusy(true);
    setError(null);
    try {
      await saveSiteTheme({ data: theme });
      setSaved(true);
      setDirty(false);
      await router.invalidate();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save.");
    } finally {
      setBusy(false);
    }
  }

  const sizePx = FONT_SIZES.find((s) => s.id === theme.fontSize)?.px ?? "16px";
  const presetLabel =
    theme.preset === "custom"
      ? "Custom colours"
      : (THEME_PRESETS.find((p) => p.id === theme.preset)?.label ?? "Custom");

  const saveBtn = (
    <Button
      type="button"
      disabled={busy}
      onClick={() => void save()}
      className="bg-bronze text-ink hover:bg-bronze-soft"
    >
      {busy ? "Saving…" : saved && !dirty ? "Saved" : "Save"}
    </Button>
  );

  return (
    <section id="appearance" className="space-y-8">
      {showHeading ? (
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[10px] tracking-[0.2em] text-bronze uppercase">Website style</p>
            <h2 className="font-display text-3xl font-semibold">Font, colour & themes</h2>
            <p className="mt-1 max-w-xl text-sm text-parchment/60">
              These dress the public shop for every visitor. Change, then press Save.
            </p>
          </div>
          {saveBtn}
        </div>
      ) : (
        <div className="flex justify-end">{saveBtn}</div>
      )}

      <p className="rounded-xl border border-white/8 bg-white/4 px-4 py-3 text-sm text-parchment/70">
        Live now: <span className="text-parchment">{presetLabel}</span>
        {" · "}
        {theme.displayFont}
        {" · "}
        {FONT_SIZES.find((s) => s.id === theme.fontSize)?.label}
        {dirty ? <span className="ml-2 text-bronze">Unsaved changes</span> : null}
      </p>

      <DeskTabs
        tabs={[
          { id: "themes", label: "Themes" },
          { id: "fonts", label: "Font & size" },
          { id: "colours", label: "Colours" },
        ]}
        value={pane}
        onChange={setPane}
        label="Website style"
      />

      {pane === "themes" ? (
      <div>
        <p className="text-[10px] tracking-[0.18em] text-bronze uppercase">3 · Themes style for website</p>
        <h3 className="mt-1 font-display text-2xl">Pick a look</h3>
        <p className="mt-1 text-sm text-parchment/55">
          {THEME_PRESETS.length} colour combinations. One tap fills background, type, buttons and
          gold. You can still tweak colours on the Colours tab.
        </p>
        {(["light", "dark"] as const).map((kind) => (
          <div key={kind} className="mt-5">
            <p className="text-xs tracking-[0.14em] text-parchment/45 uppercase">
              {kind === "light" ? "Light looks" : "Dark looks"}
            </p>
            <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {THEME_PRESETS.filter((p) => p.kind === kind).map((p) => {
                const on = theme.preset === p.id;
                const btnInk = p.kind === "dark" ? p.ink : p.parchment;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => pickPreset(p.id)}
                    className={cn(
                      "rounded-2xl border p-3 text-left transition-colors",
                      on ? "border-bronze bg-white/10" : "border-white/10 hover:border-white/25",
                    )}
                  >
                    <span
                      className="block overflow-hidden rounded-xl border border-black/10 p-3"
                      style={{ background: p.parchment, color: p.ink }}
                    >
                      <span className="flex h-1.5 overflow-hidden rounded-full">
                        <span className="flex-1" style={{ background: p.ink }} />
                        <span className="flex-1" style={{ background: p.garnet }} />
                        <span className="flex-1" style={{ background: p.bronze }} />
                      </span>
                      <span
                        className="mt-3 block font-display text-lg leading-none"
                        style={{ fontFamily: `"${theme.displayFont}", serif` }}
                      >
                        Sadhguru
                      </span>
                      <span
                        className="mt-2 inline-flex h-6 items-center rounded-md px-2 text-[10px]"
                        style={{ background: p.garnet, color: btnInk }}
                      >
                        Enquire
                      </span>
                      <span className="mt-3 flex items-center gap-1.5">
                        {[p.parchment, p.ink, p.garnet, p.bronze].map((c, i) => (
                          <span
                            key={`${p.id}-${i}`}
                            className="size-4 rounded-full border border-black/15 shadow-sm"
                            style={{ background: c }}
                            title={c}
                          />
                        ))}
                      </span>
                    </span>
                    <span className="mt-2 flex items-center justify-between gap-2">
                      <span>
                        <span className="block text-sm font-medium">{p.label}</span>
                        <span className="block text-[11px] text-parchment/50">{p.note}</span>
                      </span>
                      {on ? <Check className="size-4 shrink-0 text-bronze" /> : null}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      ) : null}

      {pane === "fonts" ? (
      <div>
        <p className="text-[10px] tracking-[0.18em] text-bronze uppercase">1 · Font and font size</p>
        <h3 className="mt-1 font-display text-2xl">Type for the house</h3>
        <p className="mt-3 text-xs tracking-[0.14em] text-parchment/45 uppercase">Heading font</p>
        <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
          {DISPLAY_FONTS.map((f) => {
            const on = theme.displayFont === f;
            return (
              <button
                key={f}
                type="button"
                onClick={() => patch({ displayFont: f })}
                className={cn(
                  "min-h-20 rounded-2xl border px-3 py-3 text-left",
                  on ? "border-bronze bg-white/10" : "border-white/10 hover:border-white/25",
                )}
              >
                <span className="block text-2xl leading-none" style={{ fontFamily: `"${f}", serif` }}>
                  Ag
                </span>
                <span className="mt-2 block text-[11px] text-parchment/60">{f}</span>
              </button>
            );
          })}
        </div>

        <p className="mt-6 text-xs tracking-[0.14em] text-parchment/45 uppercase">Body font</p>
        <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
          {BODY_FONTS.map((f) => {
            const on = theme.bodyFont === f;
            return (
              <button
                key={f}
                type="button"
                onClick={() => patch({ bodyFont: f })}
                className={cn(
                  "min-h-20 rounded-2xl border px-3 py-3 text-left",
                  on ? "border-bronze bg-white/10" : "border-white/10 hover:border-white/25",
                )}
              >
                <span className="block text-lg leading-none" style={{ fontFamily: `"${f}", sans-serif` }}>
                  Body
                </span>
                <span className="mt-2 block text-[11px] text-parchment/60">{f}</span>
              </button>
            );
          })}
        </div>

        <p className="mt-6 text-xs tracking-[0.14em] text-parchment/45 uppercase">Font size</p>
        <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {FONT_SIZES.map((s) => {
            const on = theme.fontSize === s.id;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => patch({ fontSize: s.id })}
                className={cn(
                  "rounded-2xl border px-4 py-4 text-left",
                  on ? "border-bronze bg-white/10" : "border-white/10 hover:border-white/25",
                )}
              >
                <span className="block leading-none" style={{ fontSize: s.px }}>
                  Aa
                </span>
                <span className="mt-2 block text-sm font-medium">{s.label}</span>
                <span className="block text-[11px] text-parchment/50">{s.px} on the shop</span>
              </button>
            );
          })}
        </div>
      </div>
      ) : null}

      {pane === "colours" ? (
      <div>
        <p className="text-[10px] tracking-[0.18em] text-bronze uppercase">2 · Website colour changes</p>
        <h3 className="mt-1 font-display text-2xl">Colours of the shop</h3>
        <p className="mt-1 text-sm text-parchment/55">
          Tap a swatch or type a hex. Press Save to publish.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <ColorField
            label="Background"
            hint="Page parchment"
            value={theme.parchment}
            onChange={(v) => patch({ parchment: v, preset: "custom" })}
          />
          <ColorField
            label="Text"
            hint="Headings and copy"
            value={theme.ink}
            onChange={(v) => patch({ ink: v, preset: "custom" })}
          />
          <ColorField
            label="Accent / buttons"
            hint="Enquire, WhatsApp, links"
            value={theme.garnet}
            onChange={(v) => patch({ garnet: v, preset: "custom" })}
          />
          <ColorField
            label="Gold / metal"
            hint="Small labels and shine"
            value={theme.bronze}
            onChange={(v) => patch({ bronze: v, preset: "custom" })}
          />
        </div>
      </div>
      ) : null}

      <div
        className="overflow-hidden rounded-2xl border border-white/10"
        style={{
          background: theme.parchment,
          color: theme.ink,
          fontFamily: `"${theme.bodyFont}", sans-serif`,
          fontSize: sizePx,
        }}
      >
        <div
          className="flex items-center justify-between px-5 py-3 text-[11px] tracking-wide"
          style={{ background: theme.ink, color: theme.parchment }}
        >
          <span>Solapur · Mon–Sat</span>
          <span style={{ color: theme.bronze }}>+91 70207 35981</span>
        </div>
        <div className="px-5 py-6">
          <p className="text-[10px] tracking-[0.2em] uppercase" style={{ color: theme.garnet }}>
            Preview — not yet live until Save
          </p>
          <p className="mt-2 text-3xl font-semibold" style={{ fontFamily: `"${theme.displayFont}", serif` }}>
            Sadhguru Gems & Jewellers
          </p>
          <p className="mt-2 max-w-md text-sm opacity-80">
            Stones with names, from Akkalkot Road. Certified gems, gold, silver, brass and copper.
          </p>
          <span
            className="mt-4 inline-flex h-10 items-center rounded-xl px-4 text-sm"
            style={{ background: theme.garnet, color: theme.parchment }}
          >
            Enquire
          </span>
        </div>
      </div>

      {error ? <p className="text-sm text-red-300">{error}</p> : null}
      {saved && !dirty ? (
        <p className="text-sm text-bronze">
          Saved.{" "}
          <Link to="/" className="underline">
            View website
          </Link>{" "}
          — colours, fonts and size are live for every visitor.
        </p>
      ) : null}

      <div className="sticky bottom-3 z-10 flex flex-wrap items-center gap-2 rounded-2xl border border-white/10 bg-[#0c1612]/95 p-3 backdrop-blur">
        <Button
          type="button"
          disabled={busy}
          onClick={() => void save()}
          className="bg-bronze text-ink hover:bg-bronze-soft"
        >
          {busy ? "Saving…" : saved && !dirty ? "Saved" : "Save website style"}
        </Button>
        <button
          type="button"
          className="inline-flex h-11 items-center gap-2 rounded-xl border border-white/15 px-4 text-sm"
          onClick={() => {
            setTheme(DEFAULT_THEME);
            setSaved(false);
            setDirty(true);
          }}
        >
          <RotateCcw className="size-3.5" />
          Reset to Heritage
        </button>
        <Link to="/" className="ml-auto text-sm text-bronze hover:text-bronze-soft">
          View website
        </Link>
      </div>
    </section>
  );
}
