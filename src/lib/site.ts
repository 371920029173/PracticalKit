/**
 * Canonical site origin (no trailing slash).
 *
 * Priority:
 * 1) NEXT_PUBLIC_SITE_URL — set in Cloudflare Pages for production
 * 2) Production branch on Cloudflare → practicalkithub.com
 * 3) CF_PAGES_URL — preview deployments only
 * 4) Hard-coded production domain
 */
export const CANONICAL_PRODUCTION_URL = "https://practicalkithub.com";

function normalizeSiteOrigin(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) {
    try {
      return new URL(explicit).origin;
    } catch {
      /* fall through */
    }
  }

  const branch = process.env.CF_PAGES_BRANCH?.trim();
  if (branch === "master" || branch === "main") {
    return CANONICAL_PRODUCTION_URL;
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

  return CANONICAL_PRODUCTION_URL;
}

export const SITE_URL = normalizeSiteOrigin();

export const SITE_NAME = "PracticalKit";
export const SITE_DESCRIPTION =
  "Browser-first utilities for PDF, image, data, text, developer workflows, and lightweight media conversion.";
