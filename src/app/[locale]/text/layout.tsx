import type { ReactNode } from "react";
import { createPageMetadata } from "@/lib/seo-metadata";

export const generateMetadata = createPageMetadata("text", (m) => m.text.title);

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
