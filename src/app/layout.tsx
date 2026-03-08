import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
// Leaflet CSS must be a top-level import so webpack bundles it with the
// initial page CSS. Importing inside a dynamic ssr:false component is
// unreliable in Next.js App Router (PostCSS can't resolve @import at build time).
import "leaflet/dist/leaflet.css";
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
        {/* Must run before React hydration to prevent dark-mode flash */}
        <ThemeScript />
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
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
