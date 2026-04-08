import type { ReactNode } from "react";
import { createPageMetadata } from "@/lib/seo-metadata";

export const generateMetadata = createPageMetadata("encoding", (m) => m.encoding.title);

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
