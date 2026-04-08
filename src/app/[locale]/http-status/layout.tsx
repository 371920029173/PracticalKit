import type { ReactNode } from "react";
import { createPageMetadata } from "@/lib/seo-metadata";

export const generateMetadata = createPageMetadata("http-status", (m) => m.httpStatusPage.title);

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
