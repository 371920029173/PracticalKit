import type { ReactNode } from "react";
import { ToolEditorialFooter } from "@/components/ToolEditorialFooter";
import { createPageMetadata } from "@/lib/seo-metadata";

export const generateMetadata = createPageMetadata(
  "url-parser",
  (m) => m.urlParserPage.title,
  (m) => m.urlParserPage.note,
);

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <ToolEditorialFooter mode="local" navKey="urlParser" />
    </>
  );
}
