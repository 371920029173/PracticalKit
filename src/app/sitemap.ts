import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import {
  SITEMAP_LOCALES,
  STATIC_PAGE_ROUTES,
  TOOL_SEGMENTS,
} from "@/lib/tools-registry";

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

  for (const locale of SITEMAP_LOCALES) {
    items.push({
      url: `${SITE_URL}/${locale}/`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    });

    for (const route of [...TOOL_SEGMENTS, ...STATIC_PAGE_ROUTES]) {
      items.push({
        url: `${SITE_URL}/${locale}/${route}/`,
        lastModified: now,
        changeFrequency: route === "blog" ? "weekly" : "weekly",
        priority: STATIC_PAGE_ROUTES.includes(route as (typeof STATIC_PAGE_ROUTES)[number])
          ? 0.5
          : 0.7,
      });
    }
  }

  return items;
}
