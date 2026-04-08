import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

const locales = ["en", "zh", "ru", "es"] as const;
const routes = [
  "",
  "pdf",
  "image",
  "data",
  "text",
  "qr",
  "units",
  "time",
  "calc",
  "encoding",
  "password",
  "translate",
  "code",
  "money",
  "markdown",
  "random",
  "json-diff",
  "hash",
  "jwt",
  "csv-json",
  "slug",
  "html-entities",
  "css-min",
  "lorem",
  "unicode",
  "cidr",
  "function-plot",
  "cron",
  "http-status",
  "api-snippet",
  "color",
  "video-gif",
  "audio",
  "regex",
  "rgbv3d",
  "privacy",
  "terms",
  "disclaimer",
  "about",
  "blog",
  "contact",
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const items: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
  ];
  for (const locale of locales) {
    for (const route of routes) {
      const suffix = route ? `/${route}/` : "/";
      items.push({
        url: `${SITE_URL}/${locale}${suffix}`,
        lastModified: now,
        changeFrequency: route ? "weekly" : "daily",
        priority: route ? 0.7 : 0.9,
      });
    }
  }
  return items;
}
