import type { ReactNode } from "react";
import { ToolEditorialFooter } from "@/components/ToolEditorialFooter";

export default function RgbV3dToolLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <ToolEditorialFooter mode="fileMedia" navKey="rgbv3d" />
    </>
  );
}
