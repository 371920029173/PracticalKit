import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";

const orgId = `${SITE_URL}/#organization`;
const siteId = `${SITE_URL}/#website`;

export function JsonLd() {
  const graph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": orgId,
        name: SITE_NAME,
        url: SITE_URL,
        logo: `${SITE_URL}/favicon.ico`,
      },
      {
        "@type": "WebSite",
        "@id": siteId,
        name: SITE_NAME,
        url: `${SITE_URL}/`,
        description: SITE_DESCRIPTION,
        publisher: { "@id": orgId },
        inLanguage: ["en", "zh-CN", "ru", "es"],
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }}
    />
  );
}
