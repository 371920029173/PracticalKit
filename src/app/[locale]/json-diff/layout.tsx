import type { ReactNode } from "react";
import { createPageMetadata } from "@/lib/seo-metadata";

export const generateMetadata = createPageMetadata("json-diff", (m) => m.jsonDiffPage.title);

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
