export const SLIDE_KINDS = ["poster", "video", "story"] as const;
export type SlideKind = (typeof SLIDE_KINDS)[number];

export const SLIDE_KIND_COPY: Record<
  SlideKind,
  { title: string; note: string; kicker: string; aspect: string }
> = {
  poster: {
    kicker: "Red slots",
    title: "Ad posters",
    note: "Landscape campaign stills. Two sit at the top of the homepage hero. Upload a JPG or PNG.",
    aspect: "16 / 9",
  },
  video: {
    kicker: "Yellow slots",
    title: "Product videos",
    note: "Portrait reels of the piece. Upload MP4, or paste a YouTube link.",
    aspect: "9 / 16",
  },
  story: {
    kicker: "Top rail",
    title: "Stories",
    note: "Small circles above the hero — festival, pearl, brass.",
    aspect: "3 / 4",
  },
};

export function youtubeId(url: string): string | null {
  const t = url.trim();
  if (!t) return null;
  const m = t.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/,
  );
  return m?.[1] ?? (/^[A-Za-z0-9_-]{11}$/.test(t) ? t : null);
}

export function youtubeThumb(id: string) {
  return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
}

export function youtubeEmbed(id: string, extra = "") {
  const q = extra ? `&${extra}` : "";
  return `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1${q}`;
}

export function looksLikeVideoFile(path: string) {
  return /\.(mp4|webm|ogg)(\?|$)/i.test(path);
}
