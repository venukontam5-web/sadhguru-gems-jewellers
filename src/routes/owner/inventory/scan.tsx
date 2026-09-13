import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { Camera, CheckCircle2, ImagePlus, Keyboard, Minus, Plus, Printer, Usb, XCircle } from "lucide-react";
import { ownerAdjustStock, ownerLookupSku } from "@/server/stock";
import { money, type StockRow } from "@/lib/inventory";
import {
  checkCode128,
  code128Svg,
  decodeCode128FromImageData,
  looksLikeSku,
  normalizeSku,
} from "@/lib/barcode";
import { SkuBarcode } from "@/components/sku-barcode";
import { InventoryHeading, InventoryNav, StockPill } from "@/components/inventory-nav";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/owner/inventory/scan")({
  component: ScanDesk,
});

const SAMPLE_SKUS = ["SGJ-0001", "SGJ-0005", "SGJ-0014", "SGJ-0019"];

function beep(ok = true) {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = ok ? 880 : 220;
    gain.gain.value = 0.05;
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + (ok ? 0.08 : 0.16));
    void ctx.resume();
  } catch {
    /* no audio */
  }
}

async function imageDataFromFile(file: File) {
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.src = url;
    await img.decode();
    const max = 1600;
    let w = img.naturalWidth;
    let h = img.naturalHeight;
    if (w > max) {
      h = Math.round((h * max) / w);
      w = max;
    }
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return null;
    ctx.drawImage(img, 0, 0, w, h);
    return ctx.getImageData(0, 0, w, h);
  } catch {
    return null;
  } finally {
    URL.revokeObjectURL(url);
  }
}

async function imageDataFromSvg(svg: string) {
  const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  try {
    const img = new Image();
    img.src = url;
    await img.decode();
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, img.naturalWidth);
    canvas.height = Math.max(1, img.naturalHeight);
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return null;
    ctx.drawImage(img, 0, 0);
    return ctx.getImageData(0, 0, canvas.width, canvas.height);
  } catch {
    return null;
  } finally {
    URL.revokeObjectURL(url);
  }
}

function ScanDesk() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [code, setCode] = useState("");
  const [hit, setHit] = useState<StockRow | null>(null);
  const [miss, setMiss] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [log, setLog] = useState<StockRow[]>([]);
  const [camera, setCamera] = useState(false);
  const [photoNote, setPhotoNote] = useState<string | null>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, [hit]);

  const lookup = useCallback(async (raw: string) => {
    const sku = normalizeSku(raw);
    if (!sku) return;
    setBusy(true);
    setMiss(null);
    setPhotoNote(null);
    try {
      const row = await ownerLookupSku({ data: { sku } });
      if (!row) {
        setHit(null);
        setMiss(sku);
        beep(false);
        return;
      }
      beep(true);
      setHit(row);
      setLog((prev) => [row, ...prev.filter((p) => p.id !== row.id)].slice(0, 8));
      setCode("");
    } finally {
      setBusy(false);
      inputRef.current?.focus();
    }
  }, []);

  useHidScan(lookup);

  async function bump(delta: number) {
    if (!hit) return;
    await ownerAdjustStock({
      data: { productId: hit.id, qtyDelta: delta, note: "Barcode count" },
    });
    const row = await ownerLookupSku({ data: { sku: hit.sku } });
    if (row) {
      setHit(row);
      setLog((prev) => [row, ...prev.filter((p) => p.id !== row.id)].slice(0, 8));
    }
    inputRef.current?.focus();
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    void lookup(code);
  }

  async function onPhoto(file: File | null) {
    if (!file) return;
    setPhotoNote("Reading the label…");
    const data = await imageDataFromFile(file);
    if (!data) {
      setPhotoNote("Could not open that photo.");
      return;
    }
    const value = decodeCode128FromImageData(data);
    if (!value) {
      setPhotoNote("No Code 128 on that photo. Hold the label flat, fill the frame.");
      beep(false);
      return;
    }
    setPhotoNote(`Read ${value}`);
    await lookup(value);
  }

  return (
    <div>
      <InventoryHeading
        kicker="Inventory"
        title="Barcode scanner"
        note="USB gun, laptop camera, or a photo of the label. Code 128 of SGJ-0001 … SGJ-0020 is on every sticker."
        action={
          <Link
            to="/owner/inventory/labels"
            className={cn(buttonVariants({ size: "sm" }), "bg-bronze text-ink hover:bg-bronze-soft")}
          >
            <Printer className="size-4" />
            Print labels
          </Link>
        }
      />
      <InventoryNav />

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <Hint icon={Usb} title="USB scanner" body="Plug a HID gun. Click the box, scan. It types the SKU and Enter." />
        <Hint icon={Camera} title="Camera" body="Live camera or a photo of the pouch label. Reads house Code 128." />
        <Hint icon={Keyboard} title="Type" body="Type SGJ-0019 or just 19. Same as a scan." />
      </div>

      <ScannerCheck />

      <form onSubmit={onSubmit} className="mt-6 rounded-2xl border border-bronze/40 bg-white/4 p-4 sm:p-5">
        <label className="text-[10px] tracking-[0.18em] text-bronze uppercase">Scanner ready</label>
        <input
          ref={inputRef}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Tab" && code.trim()) {
              e.preventDefault();
              void lookup(code);
            }
          }}
          placeholder="Scan or type SKU…"
          autoComplete="off"
          autoFocus
          inputMode="text"
          className="mt-2 h-14 w-full rounded-xl border border-white/15 bg-black/40 px-4 font-mono text-xl tracking-wide text-parchment outline-none focus:border-bronze"
        />
        <div className="mt-3 flex flex-wrap gap-2">
          <Button type="submit" disabled={busy || !code.trim()} className="bg-bronze text-ink hover:bg-bronze-soft">
            {busy ? "Looking…" : "Look up"}
          </Button>
          <Button
            type="button"
            variant="ivory"
            className="border border-white/15 bg-transparent text-parchment"
            onClick={() => setCamera((v) => !v)}
          >
            <Camera className="size-4" />
            {camera ? "Close camera" : "Use camera"}
          </Button>
          <label className={cn(buttonVariants({ variant: "ivory" }), "cursor-pointer border border-white/15 bg-transparent text-parchment")}>
            <ImagePlus className="size-4" />
            Scan a photo
            <input
              type="file"
              accept="image/*"
              capture="environment"
              className="sr-only"
              onChange={(e) => {
                const file = e.target.files?.[0] ?? null;
                e.target.value = "";
                void onPhoto(file);
              }}
            />
          </label>
        </div>
        {photoNote ? <p className="mt-3 text-sm text-parchment/60">{photoNote}</p> : null}
      </form>

      {camera ? <CameraPane onCode={(c) => void lookup(c)} /> : null}

      <SampleStrip onPick={(sku) => void lookup(sku)} />

      {miss ? (
        <p className="mt-4 rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-200">
          No piece for <span className="font-mono">{miss}</span>. Check the label or print a new one.
        </p>
      ) : null}

      {hit ? (
        <article className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-white/4">
          <div className="flex flex-wrap items-start gap-4 p-5">
            <img src={hit.imagePath} alt="" className="product-shot size-24 rounded-xl bg-ivory object-contain" loading="lazy" decoding="async" />
            <div className="min-w-0 flex-1">
              <p className="font-mono text-xs text-bronze">{hit.sku}</p>
              <h2 className="font-display text-3xl">{hit.name}</h2>
              <p className="mt-1 text-sm text-parchment/60">
                {hit.location} · {hit.category}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className="font-display text-3xl">{hit.stock}</span>
                <span className="text-sm text-parchment/55">on hand · {money(hit.retailValue)}</span>
                <StockPill status={hit.status} />
              </div>
            </div>
            <SkuBarcode value={hit.sku} height={48} className="rounded-md" />
          </div>
          <div className="flex flex-wrap gap-2 border-t border-white/8 px-5 py-4">
            <Button type="button" className="bg-bronze text-ink hover:bg-bronze-soft" onClick={() => void bump(1)}>
              <Plus className="size-4" />
              +1 in
            </Button>
            <Button
              type="button"
              variant="ivory"
              className="border border-white/15 bg-transparent text-parchment"
              onClick={() => void bump(-1)}
            >
              <Minus className="size-4" />
              −1 out
            </Button>
            <Link
              to="/owner/bills/sale"
              search={{ sku: hit.sku }}
              className={cn(buttonVariants(), "border border-white/15 bg-transparent")}
            >
              New sale bill
            </Link>
            <Link to="/owner/inventory/labels" search={{ sku: hit.sku }} className="inline-flex h-11 items-center px-3 text-sm text-bronze">
              Print this label
            </Link>
          </div>
        </article>
      ) : null}

      {log.length ? (
        <div className="mt-8">
          <h2 className="font-display text-2xl">Recent scans</h2>
          <ul className="mt-3 divide-y divide-white/8 rounded-2xl border border-white/8">
            {log.map((p) => (
              <li key={p.id}>
                <button
                  type="button"
                  className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left hover:bg-white/4"
                  onClick={() => setHit(p)}
                >
                  <span>
                    <span className="block text-sm">{p.name}</span>
                    <span className="font-mono text-[11px] text-parchment/45">{p.sku}</span>
                  </span>
                  <span className="text-sm">{p.stock}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

function Hint({ icon: Icon, title, body }: { icon: typeof Usb; title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
      <Icon className="size-5 text-bronze" />
      <p className="mt-2 font-medium">{title}</p>
      <p className="mt-1 text-sm text-parchment/55">{body}</p>
    </div>
  );
}

type CheckRow = { sku: string; bits: boolean; print: boolean; read: string | null };

function ScannerCheck() {
  const [rows, setRows] = useState<CheckRow[] | null>(null);
  const [running, setRunning] = useState(false);

  const run = useCallback(async () => {
    setRunning(true);
    const next: CheckRow[] = [];
    for (const sku of SAMPLE_SKUS) {
      const chk = checkCode128(sku);
      let print = false;
      let read = chk.read;
      try {
        const svg = code128Svg(sku, { height: 48, module: 3 });
        const data = await imageDataFromSvg(svg);
        if (data) {
          const decoded = decodeCode128FromImageData(data);
          print = decoded === sku;
          if (decoded) read = decoded;
        }
      } catch {
        print = false;
      }
      next.push({ sku, bits: chk.bits && chk.scan, print, read });
    }
    setRows(next);
    setRunning(false);
  }, []);

  useEffect(() => {
    void run();
  }, [run]);

  const ok = rows?.every((r) => r.bits && r.print) ?? false;

  return (
    <div className="mt-6 rounded-2xl border border-white/8 bg-white/4 p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[10px] tracking-[0.18em] text-bronze uppercase">Scanner check</p>
          <h2 className="font-display text-2xl">House barcodes</h2>
          <p className="mt-1 text-sm text-parchment/55">
            Encoder, scanline and printed Code 128 of the pouch SKUs.
          </p>
        </div>
        <Button
          type="button"
          variant="ivory"
          className="border border-white/15 bg-transparent text-parchment"
          onClick={() => void run()}
          disabled={running}
        >
          {running ? "Checking…" : "Check again"}
        </Button>
      </div>
      {rows ? (
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {rows.map((r) => (
            <li key={r.sku} className="flex items-center justify-between gap-3 rounded-xl border border-white/8 px-3 py-2">
              <span className="font-mono text-sm">{r.sku}</span>
              <span className="flex items-center gap-2 text-xs text-parchment/60">
                {r.bits && r.print ? (
                  <CheckCircle2 className="size-4 text-emerald-300" />
                ) : (
                  <XCircle className="size-4 text-red-300" />
                )}
                {r.bits && r.print ? "Readable" : r.read ? `Read ${r.read}` : "Failed"}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 text-sm text-parchment/55">Checking house labels…</p>
      )}
      {rows ? (
        <p className="mt-3 text-sm text-parchment/55">
          {ok
            ? "All sample labels encode and read back. A USB gun pointed at a printed sticker will send the same SKU."
            : "One of the labels did not round-trip. Print a fresh sheet from Labels."}
        </p>
      ) : null}
    </div>
  );
}

function SampleStrip({ onPick }: { onPick: (sku: string) => void }) {
  return (
    <div className="mt-6">
      <h2 className="font-display text-2xl">Point a gun here</h2>
      <p className="mt-1 text-sm text-parchment/55">
        These are live house barcodes. Scan with a USB gun, or tap one to look it up.
      </p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {SAMPLE_SKUS.map((sku) => (
          <button
            key={sku}
            type="button"
            onClick={() => onPick(sku)}
            className="rounded-xl border border-white/10 bg-[#fbf7f0] p-3 text-left text-[#1a1410] hover:border-bronze"
          >
            <p className="font-mono text-[11px] tracking-[0.16em]">{sku}</p>
            <div className="mt-2 flex justify-center">
              <SkuBarcode value={sku} height={40} />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function useHidScan(onScan: (code: string) => void) {
  const onScanRef = useRef(onScan);
  onScanRef.current = onScan;

  useEffect(() => {
    let buf = "";
    let last = 0;
    let timer = 0;

    const commit = () => {
      const raw = buf;
      buf = "";
      if (raw.length >= 3 && looksLikeSku(raw)) onScanRef.current(raw);
    };

    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
      const now = Date.now();
      if (now - last > 140) buf = "";
      last = now;
      if (e.key === "Enter") {
        if (buf.length >= 3) {
          e.preventDefault();
          commit();
        }
        return;
      }
      if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        buf += e.key;
        window.clearTimeout(timer);
        timer = window.setTimeout(commit, 150);
      }
    };

    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.clearTimeout(timer);
    };
  }, []);
}

function CameraPane({ onCode }: { onCode: (code: string) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);
  const last = useRef("");
  const onCodeRef = useRef(onCode);
  onCodeRef.current = onCode;

  useEffect(() => {
    let stream: MediaStream | null = null;
    let timer: number | null = null;
    let dead = false;
    const Detector = (
      window as unknown as {
        BarcodeDetector?: new (o: { formats: string[] }) => {
          detect: (s: ImageBitmapSource) => Promise<{ rawValue: string }[]>;
        };
      }
    ).BarcodeDetector;

    const fire = (value: string) => {
      const sku = normalizeSku(value);
      if (!sku || sku === last.current) return;
      last.current = sku;
      onCodeRef.current(sku);
      window.setTimeout(() => {
        last.current = "";
      }, 1600);
    };

    async function tickCanvas() {
      const video = videoRef.current;
      if (dead || !video || video.readyState < 2) return;
      const w = video.videoWidth;
      const h = video.videoHeight;
      if (!w || !h) return;
      const canvas = document.createElement("canvas");
      canvas.width = Math.min(960, w);
      canvas.height = Math.round((h * canvas.width) / w);
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) return;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const found = decodeCode128FromImageData(ctx.getImageData(0, 0, canvas.width, canvas.height));
      if (found) fire(found);
    }

    async function start() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" } },
          audio: false,
        });
        const video = videoRef.current;
        if (!video) return;
        video.srcObject = stream;
        await video.play();
        const det = Detector ? new Detector({ formats: ["code_128", "code_39", "ean_13", "qr_code"] }) : null;
        const loop = async () => {
          if (dead || !videoRef.current) return;
          try {
            if (det) {
              const found = await det.detect(videoRef.current);
              const value = found[0]?.rawValue?.trim();
              if (value) fire(value);
            }
          } catch {
            /* frame skipped */
          }
          try {
            await tickCanvas();
          } catch {
            /* frame skipped */
          }
          timer = window.setTimeout(() => void loop(), 220);
        };
        void loop();
      } catch {
        setError("Camera was blocked. Allow the camera, scan a photo, or plug a USB gun.");
      }
    }
    void start();
    return () => {
      dead = true;
      if (timer) window.clearTimeout(timer);
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  return (
    <div className="mt-4 overflow-hidden rounded-2xl border border-white/10 bg-black">
      <video ref={videoRef} className="aspect-video w-full object-cover" playsInline muted />
      {error ? <p className="px-4 py-3 text-sm text-parchment/70">{error}</p> : (
        <p className="px-4 py-3 text-sm text-parchment/55">Hold a house label in the frame. Code 128 of SGJ-#### is enough.</p>
      )}
    </div>
  );
}
