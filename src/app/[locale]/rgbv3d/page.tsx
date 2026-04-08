import dynamic from "next/dynamic";
import { setRequestLocale } from "next-intl/server";

const RgbV3dToolClient = dynamic(() => import("./RgbV3dToolClient"), {
  ssr: false,
});

export default function RgbV3dPage({
  params,
}: {
  params: { locale: string };
}) {
  setRequestLocale(params.locale);
  return <RgbV3dToolClient />;
}
