import type { ReactNode } from "react";
import { createPageMetadata } from "@/lib/seo-metadata";

export const generateMetadata = createPageMetadata("units", (m) => m.units.title);

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
