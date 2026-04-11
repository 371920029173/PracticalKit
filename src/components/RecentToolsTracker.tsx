"use client";

import { usePathname } from "@/i18n/navigation";
import { recordRecentToolFromPath } from "@/lib/recent-tools";
import { useEffect, useRef } from "react";

/** Records tool visits in localStorage (locale-agnostic segment; links use current locale on home). */
export function RecentToolsTracker() {
  const pathname = usePathname();
  const last = useRef<string>("");

  useEffect(() => {
    if (pathname === last.current) return;
    last.current = pathname;
    recordRecentToolFromPath(pathname);
  }, [pathname]);

  return null;
}
