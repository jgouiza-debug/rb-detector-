import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { RegisterSW } from "@/components/pwa/RegisterSW";

/**
 * Two families, two jobs. Newsreader carries every heading and the whole keepsake
 * surface — an editorial serif drawn for reading on screen, so the memory pages
 * feel like pages. Inter does everything functional at small sizes without
 * decoration. The warmth lives in the colour and the spacing, not the letterforms.
 */
const newsreader = localFont({
  src: [
    { path: "./fonts/newsreader-latin-wght-normal.woff2", style: "normal" },
    { path: "./fonts/newsreader-latin-wght-italic.woff2", style: "italic" },
  ],
  variable: "--brand-serif",
  weight: "200 800",
  display: "swap",
});

const inter = localFont({
  src: [
    { path: "./fonts/inter-latin-wght-normal.woff2", style: "normal" },
    { path: "./fonts/inter-latin-wght-italic.woff2", style: "italic" },
  ],
  variable: "--brand-sans",
  weight: "100 900",
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "pip", template: "%s · pip" },
  description: "the journal that feels like texting a friend",
  applicationName: "pip",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "pip" },
  formatDetection: { telephone: false },
  icons: {
    icon: [{ url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" }],
    apple: [
      {
        url: "/icons/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FFF9ED" },
    { media: "(prefers-color-scheme: dark)", color: "#1C1A17" },
  ],
};

// Applies the saved theme before first paint so dark mode never flashes.
const themeScript = `(function(){try{var t=localStorage.getItem('pip-theme');if(t==='dark'||t==='light'){document.documentElement.setAttribute('data-theme',t);}}catch(e){}})();`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${newsreader.variable} ${inter.variable} scroll-clear-chrome h-full`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-full flex flex-col bg-bg text-fg font-ui">
        <a href="#main" className="skip-link">
          skip to content
        </a>
        <RegisterSW />
        {children}
      </body>
    </html>
  );
}
