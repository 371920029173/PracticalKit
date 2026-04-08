import type { ReactNode } from "react";
import { createPageMetadata } from "@/lib/seo-metadata";

export const generateMetadata = createPageMetadata("csv-json", (m) => m.csvJsonPage.title);

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
