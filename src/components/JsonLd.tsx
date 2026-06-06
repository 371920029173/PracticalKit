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
        alternateName: ["实用百宝箱", "PracticalKit", "实用工具箱"],
        url: SITE_URL,
        logo: `${SITE_URL}/favicon.ico`,
      },
      {
        "@type": "WebSite",
        "@id": siteId,
        name: SITE_NAME,
        alternateName: ["实用百宝箱", "实用工具箱"],
        url: `${SITE_URL}/`,
        description: SITE_DESCRIPTION,
        publisher: { "@id": orgId },
        inLanguage: ["en", "zh-CN", "ru", "es", "fr"],
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: `${SITE_URL}/zh/?q={search_term_string}`,
          },
          "query-input": "required name=search_term_string",
        },
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
