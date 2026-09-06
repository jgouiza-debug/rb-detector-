import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";

const fredoka = localFont({
  src: "./fonts/fredoka-latin-wght-normal.woff2",
  variable: "--font-fredoka",
  weight: "300 700",
  display: "swap",
});

const nunito = localFont({
  src: [
    { path: "./fonts/nunito-sans-latin-wght-normal.woff2", style: "normal" },
    { path: "./fonts/nunito-sans-latin-wght-italic.woff2", style: "italic" },
  ],
  variable: "--font-nunito",
  weight: "200 1000",
  display: "swap",
});

const fraunces = localFont({
  src: [
    { path: "./fonts/fraunces-latin-wght-normal.woff2", style: "normal" },
    { path: "./fonts/fraunces-latin-wght-italic.woff2", style: "italic" },
  ],
  variable: "--font-fraunces",
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
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
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
    <html lang="en" className={`${fredoka.variable} ${nunito.variable} ${fraunces.variable} h-full`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-full flex flex-col bg-bg text-fg font-ui">
        <a href="#main" className="skip-link">skip to content</a>
        {children}
      </body>
    </html>
  );
}
