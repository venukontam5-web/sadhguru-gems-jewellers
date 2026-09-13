import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import { AuthProvider } from "@/lib/auth/provider";
import { PreviewHostBridge } from "@/components/preview-host-bridge";
import { AnalyticsScripts } from "@/lib/analytics";
import { MARKETING, SITE } from "@/data/site";
import { localBusinessJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/json-ld";
import { AppErrorComponent } from "@/lib/error-component";
import { ThemeApplier } from "@/components/theme-applier";
import { CartProvider } from "@/lib/cart-store";
import { getPublicTheme } from "@/server/theme";
import { DEFAULT_THEME, googleFontsHref } from "@/lib/theme";
import appCss from "../styles.css?url";

const APP_NAME = SITE.name;

export const Route = createRootRoute({
  loader: async () => {
    let theme = DEFAULT_THEME;
    try {
      theme = await getPublicTheme();
    } catch {
      theme = DEFAULT_THEME;
    }
    return theme;
  },
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: APP_NAME },
      { name: "theme-color", content: "#1A1410" },
      { name: "description", content: SITE.description },
      { property: "og:site_name", content: SITE.name },
      { property: "og:url", content: SITE.url },
      { property: "og:image", content: `${SITE.url}/og.jpg` },
      ...(MARKETING.searchConsoleVerification
        ? [{ name: "google-site-verification", content: MARKETING.searchConsoleVerification }]
        : []),
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
      {
        rel: "stylesheet",
        href: googleFontsHref(DEFAULT_THEME),
      },
    ],
  }),
  component: RootDocument,
  errorComponent: AppErrorComponent,
});

function RootDocument() {
  const theme = Route.useLoaderData();
  return (
    <html lang="en-IN" suppressHydrationWarning>
      <head>
        <HeadContent />
        <AnalyticsScripts />
      </head>
      <body className="antialiased">
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
