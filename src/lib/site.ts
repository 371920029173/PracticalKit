/**
 * Canonical site origin (no trailing slash).
 *
 * 1) NEXT_PUBLIC_SITE_URL — use your real custom domain in production.
 * 2) CF_PAGES_URL — set automatically on Cloudflare Pages builds (`*.pages.dev` or preview URL)
 *    so sitemap/robots/canonical work even before you add a custom domain.
 * 3) Otherwise https://example.com (replace via env before expecting search indexing).
 */
function normalizeSiteOrigin(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) {
    try {
      return new URL(explicit).origin;
    } catch {
      /* fall through */
    }
  }
  const cf = process.env.CF_PAGES_URL?.trim();
  if (cf) {
    try {
      const withProto = cf.startsWith("http") ? cf : `https://${cf}`;
      return new URL(withProto).origin;
    } catch {
      /* fall through */
    }
  }
  return "https://example.com";
}

export const SITE_URL = normalizeSiteOrigin();

export const SITE_NAME = "PracticalKit";
export const SITE_DESCRIPTION =
  "Browser-first utilities for PDF, image, data, text, developer workflows, and lightweight media conversion.";
