"use client";

import { toolBySegment } from "@/lib/tools-registry";
import { useTranslations } from "next-intl";
import { usePathname } from "@/i18n/navigation";
import { useEffect, useState } from "react";

const SKIP_PREFIX = "pk-welcome-skip-v1:";

function segmentFromPath(pathname: string): string | null {
  const trimmed = pathname.replace(/^\/+|\/+$/g, "");
  const seg = trimmed.split("/").filter(Boolean)[0];
  return seg || null;
}

export function ToolWelcomeOverlay() {
  const pathname = usePathname();
  const t = useTranslations("toolWelcome");
  const nav = useTranslations("nav");
  const home = useTranslations("home");

  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const segment = segmentFromPath(pathname);
    if (!segment) return;
    const tool = toolBySegment(segment);
    if (!tool) return;

    try {
      if (localStorage.getItem(SKIP_PREFIX + segment) === "1") return;
    } catch {
      return;
    }

    const timer = window.setTimeout(() => setVisible(true), 120);
    return () => window.clearTimeout(timer);
  }, [pathname]);

  if (!mounted || !visible) return null;

  const segment = segmentFromPath(pathname);
  const tool = segment ? toolBySegment(segment) : undefined;
  if (!tool) return null;

  const toolName = nav(tool.navKey);
  const blurb = home(`toolBlurbs.${tool.navKey}` as "toolBlurbs.pdf");

  function dismiss(persist: boolean) {
    if (persist && segment) {
      try {
        localStorage.setItem(SKIP_PREFIX + segment, "1");
      } catch {
        /* ignore */
      }
    }
    setVisible(false);
  }

  return (
    <div
      className="animate-fade-up mb-8 overflow-hidden rounded-2xl border border-indigo-200/60 bg-gradient-to-br from-indigo-50/90 via-white/90 to-violet-50/80 p-6 shadow-lg shadow-indigo-500/10 dark:border-indigo-800/50 dark:from-indigo-950/40 dark:via-zinc-950/80 dark:to-violet-950/30"
      role="region"
      aria-labelledby="tool-welcome-heading"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-3">
          <p className="section-kicker">{t("kicker")}</p>
          <h2 id="tool-welcome-heading" className="text-xl font-bold text-slate-900 dark:text-white">
            {t("title", { toolName })}
          </h2>
          <p className="max-w-2xl text-sm leading-relaxed text-slate-700 dark:text-zinc-300">
            {blurb}
          </p>
          <p className="max-w-2xl text-sm leading-relaxed text-slate-600 dark:text-zinc-400">
            {t("editorialNote")}
          </p>
        </div>
        <div className="loader-row shrink-0" aria-hidden>
          <span className="loader-dot" style={{ animationDelay: "0ms" }} />
          <span className="loader-dot" style={{ animationDelay: "120ms" }} />
          <span className="loader-dot" style={{ animationDelay: "240ms" }} />
        </div>
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        <button type="button" className="btn-primary text-sm" onClick={() => dismiss(false)}>
          {t("start")}
        </button>
        <button type="button" className="btn-ghost text-sm" onClick={() => dismiss(true)}>
          {t("skipForever")}
        </button>
      </div>
    </div>
  );
}
