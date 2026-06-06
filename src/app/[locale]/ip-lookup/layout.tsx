import type { ReactNode } from "react";
import { ToolEditorialFooter } from "@/components/ToolEditorialFooter";
import { createPageMetadata } from "@/lib/seo-metadata";

export const generateMetadata = createPageMetadata(
  "ip-lookup",
  (m) => m.ipLookupPage.title,
  (m) => m.ipLookupPage.note,
);

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <ToolEditorialFooter mode="thirdParty" navKey="ipLookup" />
    </>
  );
}
