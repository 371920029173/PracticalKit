import type { ReactNode } from "react";
import { createPageMetadata } from "@/lib/seo-metadata";

export const generateMetadata = createPageMetadata("data", (m) => m.data.title);

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
