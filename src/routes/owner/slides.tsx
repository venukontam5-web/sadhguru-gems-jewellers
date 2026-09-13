import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { ImagePlus, Play, Trash2, Upload, Video } from "lucide-react";
import { ownerDeleteSlide, ownerListSlides, ownerSaveSlide } from "@/server/catalogue";
import { ownerUploadMedia } from "@/server/media";
import { Button } from "@/components/ui/button";
import type { ShopSlide } from "@/lib/shop";
import { compressImage, readAsDataUrl } from "@/lib/media";
import { SLIDE_KIND_COPY, youtubeId, youtubeThumb, type SlideKind } from "@/lib/slides";
import { cn } from "@/lib/utils";
import { LazyVideo, MediaImg } from "@/components/product-photo";

export const Route = createFileRoute("/owner/slides")({
  component: OwnerSlides,
});

const field =
  "mt-1 h-10 w-full rounded-lg border border-white/12 bg-black/30 px-3 text-sm text-parchment outline-none focus:border-bronze";

function OwnerSlides() {
  const [tab, setTab] = useState<SlideKind>("poster");
  const [rows, setRows] = useState<ShopSlide[]>([]);
  const load = useCallback(() => {
    void ownerListSlides().then(setRows);
  }, []);
  useEffect(load, [load]);
  const list = rows.filter((s) => s.kind === tab);
  const copy = SLIDE_KIND_COPY[tab];

  return (
    <div>
      <p className="text-[10px] tracking-[0.2em] text-bronze uppercase">Homepage</p>
      <h1 className="font-display text-4xl font-semibold">Slides</h1>
      <p className="mt-1 max-w-xl text-sm text-parchment/60">
        Ad posters sit in the landscape slots at the top of the hero. Product videos sit in the
        portrait slots below. Upload from the house phone.
      </p>

      <HomepageMap posters={rows.filter((s) => s.kind === "poster" && s.active)} videos={rows.filter((s) => s.kind === "video" && s.active)} />

      <nav className="mt-8 flex gap-2 overflow-x-auto pb-1">
        {(["poster", "video"] as const).map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => setTab(k)}
            className={cn(
              "inline-flex h-11 shrink-0 items-center rounded-xl px-4 text-sm",
              tab === k ? "bg-white/12 text-parchment" : "text-parchment/65 hover:bg-white/6",
            )}
          >
            {SLIDE_KIND_COPY[k].title}
          </button>
        ))}
      </nav>

      <p className="mt-4 text-sm text-parchment/55">{copy.note}</p>

      <div className="mt-5 flex gap-3 overflow-x-auto pb-2">
        {list.map((s) => (
          <article key={s.id} className="relative w-36 shrink-0">
            <div
              className={cn(
                "overflow-hidden rounded-2xl ring-1 ring-white/10",
                tab === "poster" ? "aspect-[16/9]" : "aspect-[3/4]",
              )}
            >
              {s.kind === "video" && s.mediaType === "video" && s.videoPath ? (
                <LazyVideo src={s.videoPath} poster={s.imagePath} className="size-full object-cover" />
              ) : (
                <MediaImg src={s.imagePath} alt="" className="hero-media size-full object-cover" sizes="144px" />
              )}
            </div>
            <p className="mt-1 truncate text-xs text-parchment/70">{s.kicker || s.title}</p>
            {!s.active ? <p className="text-[11px] text-parchment/40">Hidden</p> : null}
            <button
              type="button"
              className="absolute top-1 right-1 grid size-7 place-items-center rounded-full bg-ink/80 text-parchment"
              onClick={() => void ownerDeleteSlide({ data: { id: s.id } }).then(load)}
              aria-label={`Remove ${s.title}`}
            >
              <Trash2 className="size-3.5" />
            </button>
          </article>
        ))}
        {!list.length ? (
          <p className="rounded-2xl border border-dashed border-white/12 px-4 py-8 text-sm text-parchment/50">
            Nothing in this bed yet. Upload below.
          </p>
        ) : null}
      </div>

      <SlideForm kind={tab} onSaved={load} />
    </div>
  );
}

function HomepageMap({ posters, videos }: { posters: ShopSlide[]; videos: ShopSlide[] }) {
  return (
    <div className="mt-6 overflow-hidden rounded-2xl border border-white/8 bg-[#08110e]">
      <p className="px-4 pt-3 text-[10px] tracking-[0.16em] text-bronze uppercase">Homepage hero map</p>
      <div className="p-4">
        <div className="grid grid-cols-2 gap-2">
          {(posters.length ? posters.slice(0, 2) : [null, null]).map((s, i) => (
            <div
              key={s?.id ?? `p${i}`}
              className="relative aspect-[16/9] overflow-hidden rounded-xl ring-2 ring-red-400/70"
            >
              {s ? (
                <MediaImg src={s.imagePath} alt="" className="hero-media size-full object-cover" sizes="50vw" />
              ) : (
                <div className="grid size-full place-items-center bg-white/4 text-xs text-parchment/50">
                  Ad poster
                </div>
              )}
              <span className="absolute top-1.5 left-1.5 rounded bg-red-400/90 px-1.5 py-0.5 text-[10px] font-medium tracking-wide text-ink uppercase">
                Poster
              </span>
            </div>
          ))}
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {(videos.length ? videos.slice(0, 3) : [null, null, null]).map((s, i) => (
            <div
              key={s?.id ?? `v${i}`}
              className="relative aspect-[9/16] overflow-hidden rounded-xl ring-2 ring-amber-400/70"
            >
              {s ? (
                s.videoPath && s.mediaType === "video" ? (
                  <LazyVideo src={s.videoPath} poster={s.imagePath} className="size-full object-cover" />
                ) : (
                  <MediaImg src={s.imagePath} alt="" className="hero-media size-full object-cover" sizes="33vw" />
                )
              ) : (
                <div className="grid size-full place-items-center bg-white/4 text-[11px] text-parchment/50">
                  Video
                </div>
              )}
              <span className="absolute top-1.5 left-1.5 rounded bg-amber-400/90 px-1.5 py-0.5 text-[10px] font-medium tracking-wide text-ink uppercase">
                Video
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SlideForm({ kind, onSaved }: { kind: SlideKind; onSaved: () => void }) {
  const copy = SLIDE_KIND_COPY[kind];
  const [kicker, setKicker] = useState(copy.title);
  const [title, setTitle] = useState("");
  const [link, setLink] = useState(kind === "poster" ? "/shop" : "/shop");
  const [imagePath, setImagePath] = useState("");
  const [videoPath, setVideoPath] = useState("");
  const [youtube, setYoutube] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setKicker(copy.title);
    setTitle("");
    setImagePath("");
    setVideoPath("");
    setYoutube("");
    setError(null);
  }, [kind, copy.title]);

  async function onImage(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const packed = await compressImage(file);
      const res = await ownerUploadMedia({
        data: { filename: packed.name, mime: packed.mime, dataUrl: packed.dataUrl },
      });
      setImagePath(res.path);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not upload the image.");
    } finally {
      setBusy(false);
    }
  }

  async function onVideo(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      if (file.size > 20 * 1024 * 1024) {
        throw new Error("Keep the film under 20 MB, or paste a YouTube link.");
      }
      const dataUrl = await readAsDataUrl(file);
      const res = await ownerUploadMedia({
        data: { filename: file.name, mime: file.type || "video/mp4", dataUrl },
      });
      setVideoPath(res.path);
      if (!imagePath) {
        setImagePath("/images/ruby.jpg");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not upload the video.");
    } finally {
      setBusy(false);
    }
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const yt = youtubeId(youtube);
    let mediaType: "image" | "video" | "youtube" = "image";
    let vPath = videoPath;
    let img = imagePath;
    if (kind === "video") {
      if (yt) {
        mediaType = "youtube";
        vPath = youtube.trim();
        if (!img) img = youtubeThumb(yt);
      } else if (videoPath) {
        mediaType = "video";
      } else {
        setError("Upload an MP4 or paste a YouTube link.");
        return;
      }
    }
    if (!img) {
      setError(kind === "poster" ? "Upload a poster still." : "Add a thumbnail still.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await ownerSaveSlide({
        data: {
          kind,
          kicker,
          title: title || kicker,
          imagePath: img,
          videoPath: vPath,
          mediaType,
          link: link || "/shop",
          active: true,
        },
      });
      setTitle("");
      setImagePath("");
      setVideoPath("");
      setYoutube("");
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save the slide.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="mt-8 max-w-lg rounded-2xl border border-white/8 p-5" onSubmit={(e) => void onSubmit(e)}>
      <h2 className="flex items-center gap-2 text-xs tracking-[0.16em] text-bronze uppercase">
        {kind === "video" ? <Video className="size-3.5" /> : <ImagePlus className="size-3.5" />}
        Add {copy.title.toLowerCase()}
      </h2>

      <label className="mt-4 block">
        <span className="sr-only">Upload {kind === "video" ? "thumbnail" : "poster"}</span>
        <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(e) => void onImage(e)} />
        <span className="flex min-h-32 cursor-pointer items-center justify-center overflow-hidden rounded-xl border border-dashed border-white/15 bg-black/20">
          {imagePath ? (
            <img src={imagePath} alt="" className="hero-media max-h-40 w-full object-cover" loading="lazy" decoding="async" />
          ) : (
            <span className="flex flex-col items-center gap-2 px-4 py-6 text-center text-sm text-parchment/55">
              <Upload className="size-5 text-bronze" />
              {kind === "poster" ? "Upload landscape poster" : "Upload a still (thumbnail)"}
            </span>
          )}
        </span>
      </label>

      {kind === "video" ? (
        <>
          <label className="mt-4 block">
            <span className="sr-only">Upload product video</span>
            <input type="file" accept="video/mp4,video/webm" className="sr-only" onChange={(e) => void onVideo(e)} />
            <span className="flex h-12 cursor-pointer items-center justify-center gap-2 rounded-xl border border-white/12 text-sm">
              <Play className="size-4 text-bronze" />
              {videoPath ? "Video attached — replace" : "Upload MP4 (portrait)"}
            </span>
          </label>
          {videoPath ? <p className="mt-1 font-mono text-[11px] text-parchment/45">{videoPath}</p> : null}
          <label className="mt-3 block text-xs text-parchment/60">
            Or YouTube link
            <input
              className={field}
              value={youtube}
              onChange={(e) => setYoutube(e.target.value)}
              placeholder="https://youtu.be/…"
            />
          </label>
        </>
      ) : null}

      <label className="mt-4 block text-xs text-parchment/60">
        Kicker
        <input className={field} value={kicker} onChange={(e) => setKicker(e.target.value)} />
      </label>
      <label className="mt-3 block text-xs text-parchment/60">
        Title
        <input className={field} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Shown on the slide" />
      </label>
      <label className="mt-3 block text-xs text-parchment/60">
        Link when tapped
        <input className={field} value={link} onChange={(e) => setLink(e.target.value)} />
      </label>
      {error ? <p className="mt-3 text-sm text-red-300">{error}</p> : null}
      <Button type="submit" disabled={busy} className="mt-5 bg-bronze text-ink hover:bg-bronze-soft">
        {busy ? "Saving…" : `+ Add ${copy.title.toLowerCase()}`}
      </Button>
    </form>
  );
}
