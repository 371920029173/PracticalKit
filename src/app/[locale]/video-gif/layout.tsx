import type { ReactNode } from "react";
import { createPageMetadata } from "@/lib/seo-metadata";

export const generateMetadata = createPageMetadata("video-gif", (m) => m.videoGif.title);

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
