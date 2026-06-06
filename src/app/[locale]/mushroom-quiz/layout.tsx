import type { ReactNode } from "react";
import { setRequestLocale } from "next-intl/server";
import { ToolEditorialFooter } from "@/components/ToolEditorialFooter";
import { createPageMetadata } from "@/lib/seo-metadata";

export const generateMetadata = createPageMetadata(
  "mushroom-quiz",
  (m) => m.mushroomQuizPage.title,
  (m) => m.mushroomQuizPage.note,
);

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
      <ToolEditorialFooter mode="local" navKey="mushroomQuiz" />
    </>
  );
}
