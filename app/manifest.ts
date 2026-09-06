import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "pip",
    short_name: "pip",
    description: "the journal that feels like texting a friend",
    start_url: "/thread",
    scope: "/",
    display: "standalone",
    background_color: "#FFF9ED",
    theme_color: "#FFF9ED",
    orientation: "portrait",
    categories: ["lifestyle", "health"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
