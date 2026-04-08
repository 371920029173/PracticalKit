import type { ReactNode } from "react";
import { createPageMetadata } from "@/lib/seo-metadata";

export const generateMetadata = createPageMetadata("color", (m) => m.color.title);

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
