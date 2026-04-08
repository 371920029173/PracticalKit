import type { ReactNode } from "react";
import { createPageMetadata } from "@/lib/seo-metadata";

export const generateMetadata = createPageMetadata("cidr", (m) => m.cidrPage.title);

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
