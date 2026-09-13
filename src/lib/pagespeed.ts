import { SITE } from "@/data/site";

export function pagespeedUrl(target = SITE.url, form: "mobile" | "desktop" = "mobile") {
  const url = encodeURIComponent(target);
  return `https://pagespeed.web.dev/analysis?url=${url}&form_factor=${form}`;
}

export type PsiFieldMetric = {
  name: string;
  value: string;
  category: "FAST" | "AVERAGE" | "SLOW" | "NONE";
};

export type PsiScores = {
  url: string;
  strategy: "mobile" | "desktop";
  performance: number | null;
  seo: number | null;
  accessibility: number | null;
  bestPractices: number | null;
  fcp: string;
  lcp: string;
  tbt: string;
  cls: string;
  si: string;
  opportunities: { title: string; saving: string }[];
  fieldOverall: "FAST" | "AVERAGE" | "SLOW" | "NONE";
  fieldSource: "page" | "origin" | "none";
  field: PsiFieldMetric[];
};

type CruxMetric = {
  percentile?: number;
  category?: string;
};

type Crux = {
  overall_category?: string;
  metrics?: Record<string, CruxMetric>;
};

type Lighthouse = {
  finalUrl?: string;
  categories?: Record<string, { score?: number | null }>;
  audits?: Record<
    string,
    {
      title?: string;
      displayValue?: string;
      details?: { type?: string; overallSavingsMs?: number };
    }
  >;
};

function pct(n: number | null | undefined) {
  if (n == null || Number.isNaN(n)) return null;
  return Math.round(n * 100);
}

function band(v: string | undefined): PsiFieldMetric["category"] {
  if (v === "FAST" || v === "AVERAGE" || v === "SLOW") return v;
  return "NONE";
}

function fieldMetrics(crux: Crux | undefined): PsiFieldMetric[] {
  if (!crux?.metrics) return [];
  const m = crux.metrics;
  const row = (key: string, name: string, fmt: (n: number) => string): PsiFieldMetric | null => {
    const cell = m[key];
    if (!cell || cell.percentile == null) return null;
    return { name, value: fmt(cell.percentile), category: band(cell.category) };
  };
  return [
    row("LARGEST_CONTENTFUL_PAINT_MS", "LCP", (n) => `${(n / 1000).toFixed(1)} s`),
    row("INTERACTION_TO_NEXT_PAINT", "INP", (n) => `${Math.round(n)} ms`),
    row("CUMULATIVE_LAYOUT_SHIFT_SCORE", "CLS", (n) => (n / 100).toFixed(2)),
    row("FIRST_CONTENTFUL_PAINT_MS", "FCP", (n) => `${(n / 1000).toFixed(1)} s`),
    row("EXPERIMENTAL_TIME_TO_FIRST_BYTE", "TTFB", (n) => `${Math.round(n)} ms`),
  ].filter((x): x is PsiFieldMetric => Boolean(x));
}

export function parsePsi(json: unknown, strategy: "mobile" | "desktop"): PsiScores {
  const body = json as {
    error?: { message?: string };
    lighthouseResult?: Lighthouse;
    loadingExperience?: Crux;
    originLoadingExperience?: Crux;
    id?: string;
  };
  if (body.error?.message) throw new Error(body.error.message);
  const lh = body.lighthouseResult ?? {};
  const cat = lh.categories ?? {};
  const aud = lh.audits ?? {};
  const opportunities = Object.values(aud)
    .filter((a) => a.details?.type === "opportunity" && (a.details.overallSavingsMs ?? 0) > 80)
    .sort((a, b) => (b.details?.overallSavingsMs ?? 0) - (a.details?.overallSavingsMs ?? 0))
    .slice(0, 6)
    .map((a) => ({
      title: a.title || "Opportunity",
      saving: a.displayValue || `${Math.round((a.details?.overallSavingsMs ?? 0) / 100) / 10} s`,
    }));
  const pageField = fieldMetrics(body.loadingExperience);
  const originField = fieldMetrics(body.originLoadingExperience);
  const field = pageField.length ? pageField : originField;
  const fieldSource: PsiScores["fieldSource"] = pageField.length ? "page" : originField.length ? "origin" : "none";
  const overall = band(
    (pageField.length ? body.loadingExperience?.overall_category : body.originLoadingExperience?.overall_category) ||
      "NONE",
  );
  return {
    url: lh.finalUrl || body.id || SITE.url,
    strategy,
    performance: pct(cat.performance?.score),
    seo: pct(cat.seo?.score),
    accessibility: pct(cat.accessibility?.score),
    bestPractices: pct(cat["best-practices"]?.score),
    fcp: aud["first-contentful-paint"]?.displayValue || "—",
    lcp: aud["largest-contentful-paint"]?.displayValue || "—",
    tbt: aud["total-blocking-time"]?.displayValue || "—",
    cls: aud["cumulative-layout-shift"]?.displayValue || "—",
    si: aud["speed-index"]?.displayValue || "—",
    opportunities,
    fieldOverall: overall,
    fieldSource,
    field,
  };
}
