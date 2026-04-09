/**
 * Production canonical URL. Set at build time (e.g. Cloudflare Pages):
 * NEXT_PUBLIC_SITE_URL=https://your-domain.com
 * No trailing slash. If unset, falls back to example.com — always set for real deploys.
 */
function normalizeSiteUrl(raw: string | undefined): string {
  const v = raw?.trim();
  if (!v) return "https://example.com";
  try {
    const u = new URL(v);
    return `${u.origin}`;
  } catch {
    return "https://example.com";
  }
}

export const SITE_URL = normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL);

export const SITE_NAME = "PracticalKit";
export const SITE_DESCRIPTION =
  "Browser-first utilities for PDF, image, data, text, developer workflows, and lightweight media conversion.";
