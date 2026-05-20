"use client";

import { usePathname } from "@/i18n/navigation";
import { AdsenseUnit } from "@/components/Adsense";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

const MIN_PUBLISHER_CHARS = 320;

function stripLocale(pathname: string): string {
  const m = pathname.match(/^\/(en|zh|ru|es|fr)(\/|$)/);
  if (!m) return pathname || "/";
  const rest = pathname.slice(m[0].length - (m[2] === "/" ? 1 : 0));
  return rest === "" ? "/" : rest.startsWith("/") ? rest : `/${rest}`;
}

export function ContentFirstAds() {
  const pathname = usePathname();
  const path = stripLocale(pathname);
  const t = useTranslations("adsPlacement");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(false);
    const main = document.getElementById("pk-main-content");
    if (!main) {
      setReady(false);
      return;
    }

    const hasEnoughText = () =>
      (main.innerText || "").replace(/\s+/g, " ").trim().length >=
      MIN_PUBLISHER_CHARS;

    if (hasEnoughText()) {
      setReady(true);
      return;
    }

    const obs = new MutationObserver(() => {
      if (hasEnoughText()) {
        setReady(true);
        obs.disconnect();
      }
    });
    obs.observe(main, { childList: true, subtree: true, characterData: true });

    const timer = window.setTimeout(() => {
      if (hasEnoughText()) setReady(true);
    }, 2500);

    return () => {
      obs.disconnect();
      window.clearTimeout(timer);
    };
  }, [path]);

  if (!ready) return null;

  return (
    <section
      className="mt-10 space-y-3 border-t border-slate-200/80 pt-8 dark:border-zinc-700/80"
      aria-label={t("sectionLabel")}
    >
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-zinc-500">
        {t("disclosure")}
      </p>
      <div className="glass-panel rounded-2xl p-3">
        <AdsenseUnit variant="infeed" />
      </div>
    </section>
  );
}
