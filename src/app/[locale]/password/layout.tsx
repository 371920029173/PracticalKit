import type { ReactNode } from "react";
import { createPageMetadata } from "@/lib/seo-metadata";

export const generateMetadata = createPageMetadata("password", (m) => m.password.title);

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
