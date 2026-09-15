import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import { AuthProvider } from "@/lib/auth/provider";
import { PreviewHostBridge } from "@/components/preview-host-bridge";
import { AnalyticsScripts, GtmNoscript } from "@/lib/analytics";
import { MARKETING, SITE } from "@/data/site";
import { localBusinessJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/json-ld";
import { AppErrorComponent } from "@/lib/error-component";
import { ThemeApplier } from "@/components/theme-applier";
import { CartProvider } from "@/lib/cart-store";
import { getSiteSettings } from "@/server/admin";
import { getPublicTheme } from "@/server/theme";
import { DEFAULT_THEME, googleFontsHref } from "@/lib/theme";
import appCss from "../styles.css?url";

const APP_NAME = SITE.name;

export const Route = createRootRoute({
  loader: async () => {
    let theme = DEFAULT_THEME;
    let searchConsole = MARKETING.searchConsoleVerification;
    let marketing = {
      gaId: MARKETING.gaMeasurementId,
      adsId: MARKETING.googleAdsId,
      adsLabel: MARKETING.googleAdsConversionLabel,
      gtmId: MARKETING.gtmId,
    };
    try {
      theme = await getPublicTheme();
    } catch {
      theme = DEFAULT_THEME;
    }
    try {
      const s = await getSiteSettings();
      if (s.searchConsole) searchConsole = s.searchConsole;
      marketing = {
        gaId: s.gaId || marketing.gaId,
        adsId: s.adsId || marketing.adsId,
        adsLabel: s.adsLabel || marketing.adsLabel,
        gtmId: s.gtmId || marketing.gtmId,
      };
    } catch {
      /* desk IDs stay empty until the table is ready */
    }
    return { theme, searchConsole, marketing };
  },
  head: ({ loaderData }) => {
    const verify = loaderData?.searchConsole || MARKETING.searchConsoleVerification;
    return {
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: APP_NAME },
      { name: "theme-color", content: "#1A1410" },
      { name: "description", content: SITE.description },
      { property: "og:site_name", content: SITE.name },
      { property: "og:url", content: SITE.url },
      { property: "og:image", content: `${SITE.url}/og.jpg` },
      ...(verify ? [{ name: "google-site-verification", content: verify }] : []),
    ],
    links: [
      { rel: "canonical", href: SITE.url },
      { rel: "icon", type: "image/png", href: "/favicon.png" },
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: "/__grok/manifest.webmanifest" },
      { rel: "apple-touch-icon", href: "/__grok/icon-180.png" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "dns-prefetch", href: "https://www.google-analytics.com" },
      {
        rel: "stylesheet",
        href: googleFontsHref(DEFAULT_THEME),
      },
    ],
    };
  },
  component: RootDocument,
  errorComponent: AppErrorComponent,
});

function RootDocument() {
  const { theme, marketing } = Route.useLoaderData();
  return (
    <html lang="en-IN" suppressHydrationWarning>
      <head>
        <HeadContent />
        <AnalyticsScripts ids={marketing} />
      </head>
      <body className="antialiased">
        <GtmNoscript gtmId={marketing.gtmId} />
        <PreviewHostBridge />
        <ThemeApplier theme={theme} />
        <JsonLd data={localBusinessJsonLd()} />
        <AuthProvider>
          <CartProvider>
            <Outlet />
          </CartProvider>
        </AuthProvider>
        <Scripts />
      </body>
    </html>
  );
}
