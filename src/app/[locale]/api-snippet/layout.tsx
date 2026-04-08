import type { ReactNode } from "react";
import { createPageMetadata } from "@/lib/seo-metadata";

export const generateMetadata = createPageMetadata("api-snippet", (m) => m.apiSnippetPage.title);

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
