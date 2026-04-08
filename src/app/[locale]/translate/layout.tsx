import type { ReactNode } from "react";
import { createPageMetadata } from "@/lib/seo-metadata";

export const generateMetadata = createPageMetadata("translate", (m) => m.translate.title);

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
