import type { Metadata } from "next";
import type { Messages } from "@/lib/messages";
import { loadMessages } from "@/lib/messages";
import { SITE_NAME, SITE_URL } from "@/lib/site";

/** Path after locale, e.g. "" for home, "pdf" for /en/pdf/ */
export function normalizePathSegment(segment: string): string {
  if (!segment) return "/";
  const s = segment.startsWith("/") ? segment : `/${segment}`;
  return s.endsWith("/") ? s : `${s}/`;
}

export function hrefAlternates(locale: string, pathSegment: string) {
  const p = normalizePathSegment(pathSegment);
  const languages: Record<string, string> = {
    en: `${SITE_URL}/en${p}`,
    "zh-CN": `${SITE_URL}/zh${p}`,
    ru: `${SITE_URL}/ru${p}`,
    es: `${SITE_URL}/es${p}`,
    "x-default": `${SITE_URL}/en${p}`,
  };
  return {
    canonical: `${SITE_URL}/${locale}${p}`,
    languages,
  };
}

/**
 * Per-route metadata with hreflang + canonical (static export safe).
 */
export function createPageMetadata(
  pathSegment: string,
  getTitle: (m: Messages) => string,
  getDescription?: (m: Messages) => string,
): ({
  params,
}: {
  params: { locale: string };
}) => Promise<Metadata> {
  return async function generateMetadata({
    params,
  }: {
    params: { locale: string };
  }): Promise<Metadata> {
    const messages = await loadMessages(params.locale);
    const title = getTitle(messages);
    const description = getDescription
      ? getDescription(messages)
      : messages.seo.defaultDescription;
    const alt = hrefAlternates(params.locale, pathSegment);
    const p = normalizePathSegment(pathSegment);
    const url = `${SITE_URL}/${params.locale}${p}`;
    const fullTitle = `${title} | ${SITE_NAME}`;
    return {
      title,
      description,
      alternates: {
        canonical: alt.canonical,
        languages: alt.languages,
      },
      openGraph: {
        title: fullTitle,
        description,
        url,
        siteName: SITE_NAME,
        locale: params.locale,
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title: fullTitle,
        description,
      },
    };
  };
}

/** Home uses an absolute title so the root title template does not double the brand. */
export function createHomeMetadata(): ({
  params,
}: {
  params: { locale: string };
}) => Promise<Metadata> {
  return async function generateMetadata({
    params,
  }: {
    params: { locale: string };
  }): Promise<Metadata> {
    const messages = await loadMessages(params.locale);
    const alt = hrefAlternates(params.locale, "");
    const url = `${SITE_URL}/${params.locale}/`;
    const title = `${messages.brand} — Browser tools`;
    const description = messages.seo.homeDescription;
    return {
      title: { absolute: title },
      description,
      alternates: {
        canonical: alt.canonical,
        languages: alt.languages,
      },
      openGraph: {
        title,
        description,
        url,
        siteName: SITE_NAME,
        locale: params.locale,
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
      },
    };
  };
}
