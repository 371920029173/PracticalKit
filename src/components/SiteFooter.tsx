"use client";

import { Link } from "@/i18n/navigation";
import { NAV_GROUPS } from "@/lib/nav-groups";
import { useTranslations } from "next-intl";

export function SiteFooter() {
  const t = useTranslations("siteFooter");
  const nav = useTranslations("nav");
  const tGroup = useTranslations("navGroup");

  const legalGroup = NAV_GROUPS.find((g) => g.id === "legal");

  return (
    <footer className="mt-16 border-t border-slate-200/80 bg-white/40 backdrop-blur-xl dark:border-zinc-800/80 dark:bg-zinc-950/50">
      <div className="page-shell pb-10 pt-12">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr]">
          <div className="space-y-4">
            <Link
              href="/"
              prefetch={false}
              className="inline-flex items-center gap-2 text-lg font-bold tracking-tight text-slate-900 dark:text-white"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600 text-xs font-bold text-white shadow-md">
                PK
              </span>
              PracticalKit
            </Link>
            <p className="max-w-md text-sm leading-relaxed text-slate-600 dark:text-zinc-400">
              {t("tagline")}
            </p>
          </div>
          {legalGroup ? (
            <div>
              <p className="section-kicker mb-3">{tGroup(legalGroup.labelKey)}</p>
              <ul className="grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-3">
                {legalGroup.links.map(({ href, labelKey }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      prefetch={false}
                      className="text-sm text-slate-600 hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-indigo-400"
                    >
                      {nav(labelKey)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
        <p className="mt-10 border-t border-slate-200/80 pt-6 text-center text-xs text-slate-500 dark:border-zinc-800 dark:text-zinc-500">
          {t("copyright")}
        </p>
      </div>
    </footer>
  );
}
