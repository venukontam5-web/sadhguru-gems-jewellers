import { MARKETING } from "@/data/site";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export type MarketingIds = {
  gaId: string;
  adsId: string;
  adsLabel: string;
  gtmId: string;
};

let live: MarketingIds = {
  gaId: MARKETING.gaMeasurementId,
  adsId: MARKETING.googleAdsId,
  adsLabel: MARKETING.googleAdsConversionLabel,
  gtmId: MARKETING.gtmId,
};

function only(id: string, re: RegExp) {
  const t = id.trim();
  return re.test(t) ? t : "";
}

export function sanitizeMarketing(ids: Partial<MarketingIds>): MarketingIds {
  return {
    gaId: only(ids.gaId ?? "", /^G-[A-Z0-9]+$/i),
    adsId: only(ids.adsId ?? "", /^AW-[0-9]+$/i),
    adsLabel: only(ids.adsLabel ?? "", /^[A-Za-z0-9_-]+$/),
    gtmId: only(ids.gtmId ?? "", /^GTM-[A-Z0-9]+$/i),
  };
}

export function marketingEnabled(ids: MarketingIds = live) {
  return Boolean(ids.gaId || ids.adsId || ids.gtmId);
}

export function trackLead(label = "enquiry") {
  trackGa("generate_lead", {
    currency: "INR",
    value: 0,
    lead_type: label,
  });
  if (typeof window !== "undefined" && typeof window.gtag === "function" && live.adsId && live.adsLabel) {
    window.gtag("event", "conversion", { send_to: `${live.adsId}/${live.adsLabel}` });
  }
}

export function trackGa(event: string, params: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event, ...params });
  if (typeof window.gtag === "function") window.gtag("event", event, params);
}

export function trackAddToCart(item: {
  id: number;
  slug?: string;
  name: string;
  priceInr: number;
  qty?: number;
  category?: string;
}) {
  const qty = item.qty ?? 1;
  trackGa("add_to_cart", {
    currency: "INR",
    value: item.priceInr * qty,
    items: [
      {
        item_id: item.slug || String(item.id),
        item_name: item.name,
        item_brand: "Sadhguru Gems",
        item_category: item.category || "Jewellery",
        price: item.priceInr,
        quantity: qty,
      },
    ],
  });
}

export function AnalyticsScripts({ ids }: { ids?: MarketingIds }) {
  live = sanitizeMarketing(ids ?? live);
  if (!marketingEnabled(live)) return null;
  const { gaId: ga, adsId: ads, gtmId: gtm } = live;
  const first = ga || ads;
  return (
    <>
      {gtm ? (
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
Date.now(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${gtm}');`,
          }}
        />
      ) : null}
      {!gtm && first ? (
        <>
          <script async src={`https://www.googletagmanager.com/gtag/js?id=${first}`} />
          <script
            dangerouslySetInnerHTML={{
              __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
(function(){
  var host=location.hostname;
  var live=host==='www.sadhgurugemsandjewellers.com'||host==='sadhgurugemsandjewellers.com';
  var debug=!live||/(?:^|[?&])ga_debug=1(?:&|$)/.test(location.search);
${ga ? `  gtag('config','${ga}',{anonymize_ip:true,debug_mode:debug});` : ""}
${ads ? `  gtag('config','${ads}');` : ""}
})();`,
            }}
          />
        </>
      ) : null}
    </>
  );
}

export function GtmNoscript({ gtmId }: { gtmId?: string }) {
  const id = only(gtmId ?? live.gtmId, /^GTM-[A-Z0-9]+$/i);
  if (!id) return null;
  return (
    <noscript>
      <iframe
        src={`https://www.googletagmanager.com/ns.html?id=${id}`}
        height="0"
        width="0"
        style={{ display: "none", visibility: "hidden" }}
        title="Google Tag Manager"
      />
    </noscript>
  );
}
