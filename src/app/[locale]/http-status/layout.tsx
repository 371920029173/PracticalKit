import type { ReactNode } from "react";
import { setRequestLocale } from "next-intl/server";
import { ToolEditorialFooter } from "@/components/ToolEditorialFooter";
import { createPageMetadata } from "@/lib/seo-metadata";

export const generateMetadata = createPageMetadata("http-status", (m) => m.httpStatusPage.title);

export default function Layout({
  children,
  params,
}: {
  children: ReactNode;
  params: { locale: string };
}) {
  setRequestLocale(params.locale);
  return (
    <>
      {children}
      <ToolEditorialFooter mode="local" navKey="httpStatus" />
    </>
  );
}
