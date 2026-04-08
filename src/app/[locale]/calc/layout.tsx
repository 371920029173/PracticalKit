import type { ReactNode } from "react";
import { createPageMetadata } from "@/lib/seo-metadata";

export const generateMetadata = createPageMetadata("calc", (m) => m.calc.title);

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
