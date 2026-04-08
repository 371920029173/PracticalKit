import type { ReactNode } from "react";
import { createPageMetadata } from "@/lib/seo-metadata";

export const generateMetadata = createPageMetadata("random", (m) => m.random.title);

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
