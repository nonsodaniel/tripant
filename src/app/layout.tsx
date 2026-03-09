import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/layout/AppShell";
import { ThemeScript } from "@/components/ui/ThemeScript";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Tripant — Smart Travel Guide",
    template: "%s | Tripant",
  },
  description:
    "Discover places, plan trips, and explore cities intelligently. Your personal travel companion.",
  keywords: ["travel", "travel guide", "city explorer", "trip planner", "places", "tourism"],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Tripant",
  },
  icons: {
    icon: "/icons/icon-192.svg",
    apple: "/icons/icon-192.svg",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#121214" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        {/* Theme script must run before React hydration to prevent dark-mode flash */}
        <ThemeScript />
        {/*
          Leaflet CSS served as a static file from /public/leaflet/leaflet.css.
          This avoids all webpack/SSR issues — leaflet is browser-only and must
          never be processed in a server component or PostCSS pipeline.
        */}
        <link rel="stylesheet" href="/leaflet/leaflet.css" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Tripant" />
      </head>
      <body className="antialiased">
        <AppShell>{children}</AppShell>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').catch(function() {});
                });

                // When a new SW activates and sends SW_ACTIVATED, reload the page
                // so the browser gets fresh HTML, CSS, and JS chunks — preventing
                // stale chunk-load errors and broken styles from old cached payloads.
                navigator.serviceWorker.addEventListener('message', function(e) {
                  if (e.data && e.data.type === 'SW_ACTIVATED') {
                    window.location.reload();
                  }
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
