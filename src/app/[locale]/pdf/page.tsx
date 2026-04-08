import dynamic from "next/dynamic";

const PdfToolClient = dynamic(() => import("./PdfToolClient"), { ssr: false });

export default function PdfPage() {
  return <PdfToolClient />;
}
