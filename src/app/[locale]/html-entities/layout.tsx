import type { ReactNode } from "react";
import { createPageMetadata } from "@/lib/seo-metadata";

export const generateMetadata = createPageMetadata("html-entities", (m) => m.htmlEntitiesPage.title);

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
