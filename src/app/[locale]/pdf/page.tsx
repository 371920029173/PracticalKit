import dynamic from "next/dynamic";
import { createPageMetadata } from "@/lib/seo-metadata";

const PdfToolClient = dynamic(() => import("./PdfToolClient"), { ssr: false });

export const generateMetadata = createPageMetadata("pdf", (m) => m.pdf.title);

export default function PdfPage() {
  return <PdfToolClient />;
}
