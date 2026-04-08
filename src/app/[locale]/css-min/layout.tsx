import type { ReactNode } from "react";
import { createPageMetadata } from "@/lib/seo-metadata";

export const generateMetadata = createPageMetadata("css-min", (m) => m.cssMinPage.title);

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
