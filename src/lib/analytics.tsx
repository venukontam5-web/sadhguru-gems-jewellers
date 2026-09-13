import { MARKETING } from "@/data/site";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export function marketingEnabled() {
  return Boolean(MARKETING.gaMeasurementId || MARKETING.googleAdsId || MARKETING.gtmId);
}

export function trackLead(label = "enquiry") {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;
  window.gtag("event", "generate_lead", { event_category: "engagement", event_label: label });
  if (MARKETING.googleAdsId && MARKETING.googleAdsConversionLabel) {
    window.gtag("event", "conversion", {
      send_to: `${MARKETING.googleAdsId}/${MARKETING.googleAdsConversionLabel}`,
    });
  }
}

export function AnalyticsScripts() {
  if (!marketingEnabled()) return null;
  const ga = MARKETING.gaMeasurementId;
  const ads = MARKETING.googleAdsId;
  const gtm = MARKETING.gtmId;
  const ids = [ga, ads].filter(Boolean);
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
      {ids.length ? (
        <>
          <script async src={`https://www.googletagmanager.com/gtag/js?id=${ids[0]}`} />
          <script
            dangerouslySetInnerHTML={{
              __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
${ga ? `gtag('config','${ga}',{anonymize_ip:true});` : ""}
${ads ? `gtag('config','${ads}');` : ""}`,
            }}
          />
        </>
      ) : null}
    </>
  );
}
