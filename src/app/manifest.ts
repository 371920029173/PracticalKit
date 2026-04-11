import type { MetadataRoute } from "next";
import { SITE_DESCRIPTION, SITE_NAME } from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE_NAME,
    short_name: SITE_NAME,
    description: SITE_DESCRIPTION,
    start_url: "/?utm_source=pwa",
    scope: "/",
    display: "standalone",
    orientation: "any",
    categories: ["utilities", "productivity"],
    background_color: "#f8fafc",
    theme_color: "#4f46e5",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
    shortcuts: [
      { name: "PDF", short_name: "PDF", url: "/en/pdf/" },
      { name: "Image", short_name: "Img", url: "/en/image/" },
      { name: "QR", short_name: "QR", url: "/en/qr/" },
      { name: "Calculator", short_name: "Calc", url: "/en/calc/" },
    ],
  };
}
