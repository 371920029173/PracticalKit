import type { ReactNode } from "react";
import { ToolEditorialFooter } from "@/components/ToolEditorialFooter";
import { createPageMetadata } from "@/lib/seo-metadata";

export const generateMetadata = createPageMetadata(
  "bmi",
  (m) => m.bmiPage.title,
  (m) => m.bmiPage.note,
);

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <ToolEditorialFooter mode="local" navKey="bmiCalc" />
    </>
  );
}
