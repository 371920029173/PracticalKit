import type { ReactNode } from "react";
import { ToolEditorialFooter } from "@/components/ToolEditorialFooter";
import { createPageMetadata } from "@/lib/seo-metadata";

export const generateMetadata = createPageMetadata(
  "dns-lookup",
  (m) => m.dnsLookupPage.title,
  (m) => m.dnsLookupPage.note,
);

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <ToolEditorialFooter mode="thirdParty" navKey="dnsLookup" />
    </>
  );
}
