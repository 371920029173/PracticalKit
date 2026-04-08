import type { ReactNode } from "react";
import { createPageMetadata } from "@/lib/seo-metadata";

export const generateMetadata = createPageMetadata("time", (m) => m.time.title);

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
