import dynamic from "next/dynamic";
import { createPageMetadata } from "@/lib/seo-metadata";
import { setRequestLocale } from "next-intl/server";

const RgbV3dToolClient = dynamic(() => import("./RgbV3dToolClient"), {
  ssr: false,
});

export const generateMetadata = createPageMetadata("rgbv3d", (m) => m.rgbv3d.title);

export default function RgbV3dPage({
  params,
}: {
  params: { locale: string };
}) {
  setRequestLocale(params.locale);
  return <RgbV3dToolClient />;
}
