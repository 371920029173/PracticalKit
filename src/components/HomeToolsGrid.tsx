"use client";

import { ToolTile } from "@/components/ToolTile";
import { readRecentTools, subscribeRecentTools } from "@/lib/recent-tools";
import { sortToolsForHome } from "@/lib/tool-suggestions";
import { TOOLS } from "@/lib/tools-registry";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useMemo, useState } from "react";

export function HomeToolsGrid() {
  const nav = useTranslations("nav");
  const home = useTranslations("home");
  const [recentKey, setRecentKey] = useState(0);

  const refresh = useCallback(() => setRecentKey((k) => k + 1), []);

  useEffect(() => subscribeRecentTools(refresh), [refresh]);

  const sorted = useMemo(() => {
    void recentKey;
    return sortToolsForHome(TOOLS, readRecentTools());
  }, [recentKey]);

  const recentSegments = useMemo(() => {
    void recentKey;
    return new Set(readRecentTools().map((r) => r.segment));
  }, [recentKey]);

  return (
    <div className="home-tools-grid grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {sorted.map((tool) => (
        <ToolTile
          key={tool.segment}
          href={`/${tool.segment}/`}
          navKey={tool.navKey}
          title={nav(tool.navKey)}
          blurb={home(`toolBlurbs.${tool.navKey}` as "toolBlurbs.pdf")}
          isNew={tool.isNew}
          isRecent={recentSegments.has(tool.segment)}
        />
      ))}
      <ToolTile
        href="/blog/"
        navKey="blog"
        title={nav("blog")}
        blurb={home("toolBlurbs.blog")}
      />
    </div>
  );
}
