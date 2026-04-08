"use client";

import { NextIntlClientProvider, useLocale, useTranslations } from "next-intl";
import type { Messages } from "@/lib/messages";
import { NAV_GROUPS } from "@/lib/nav-groups";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { useTheme } from "@/components/ThemeProvider";
import { CookieAndAnalytics } from "@/components/CookieAndAnalytics";

const locales = ["en", "zh", "ru", "es"] as const;

function LangSwitch() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations("common");
  const tn = useTranslations("langNames");
  return (
    <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-zinc-400">
      <span>{t("lang")}</span>
      <select
        className="btn-motion rounded-md border border-slate-300 bg-white px-2 py-1.5 text-slate-900 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100"
        value={locale}
        onChange={(e) =>
          router.replace(pathname, {
            locale: e.target.value as (typeof locales)[number],
          })
        }
      >
        {locales.map((l) => (
          <option key={l} value={l}>
            {tn(l)}
          </option>
        ))}
      </select>
    </label>
  );
}

function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const t = useTranslations("common");
  return (
    <button
      type="button"
      onClick={toggle}
      className="btn-ghost text-xs"
      aria-label={theme === "dark" ? t("themeLight") : t("themeDark")}
    >
      {theme === "dark" ? t("themeLight") : t("themeDark")}
    </button>
  );
}

function LegalStrip() {
  const t = useTranslations("legalStrip");
  const nav = useTranslations("nav");
  return (
    <div className="border-b border-amber-200/50 bg-amber-50 px-4 py-3 text-slate-900 dark:border-amber-900/40 dark:bg-amber-950/40 dark:text-amber-50">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="legal-emphasis text-slate-950 dark:text-amber-50">
            {t("title")}
          </p>
          <p className="mt-1 max-w-3xl text-sm text-slate-700 dark:text-amber-100/90">
            {t("subtitle")}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/privacy/"
            prefetch={false}
            className="btn-motion rounded-lg bg-amber-600 px-3 py-1.5 text-sm font-semibold text-white shadow hover:bg-amber-500"
          >
            {nav("privacy")}
          </Link>
          <Link
            href="/terms/"
            prefetch={false}
            className="btn-motion rounded-lg border border-amber-700 bg-white px-3 py-1.5 text-sm font-medium text-amber-900 hover:bg-amber-100 dark:border-amber-600 dark:bg-zinc-900 dark:text-amber-100 dark:hover:bg-zinc-800"
          >
            {nav("terms")}
          </Link>
          <Link
            href="/disclaimer/"
            prefetch={false}
            className="btn-motion rounded-lg border border-amber-700 px-3 py-1.5 text-sm font-medium text-amber-950 hover:bg-amber-100 dark:border-amber-600 dark:text-amber-100 dark:hover:bg-zinc-800"
          >
            {nav("disclaimer")}
          </Link>
        </div>
      </div>
    </div>
  );
}

function SidebarDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const tNav = useTranslations("nav");
  const tGroup = useTranslations("navGroup");
  const tc = useTranslations("common");

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <>
      <button
        type="button"
        aria-hidden={!open}
        className={`fixed inset-0 z-40 bg-black/60 transition-opacity duration-300 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
      />
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[min(20rem,85vw)] flex-col border-r border-slate-200 bg-white shadow-2xl transition-transform duration-300 ease-out dark:border-zinc-800 dark:bg-zinc-950 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-zinc-800">
          <Link
            href="/"
            prefetch={false}
            className="text-lg font-semibold text-slate-900 dark:text-white"
            onClick={onClose}
          >
            PracticalKit
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="btn-ghost text-xs"
          >
            {tc("close")}
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto px-2 py-4">
          <div className="mb-4">
            <Link
              href="/"
              prefetch={false}
              onClick={onClose}
              className="btn-motion block rounded-lg px-3 py-2 text-sm font-medium text-slate-800 hover:bg-slate-100 dark:text-zinc-100 dark:hover:bg-zinc-800"
            >
              {tNav("home")}
            </Link>
          </div>
          {NAV_GROUPS.map((g) => (
            <div key={g.id} className="mb-5">
              <div
                className={`px-3 pb-1 text-xs font-semibold uppercase tracking-wide ${
                  g.id === "legal"
                    ? "text-amber-700 dark:text-amber-400"
                    : "text-slate-500 dark:text-zinc-500"
                }`}
              >
                {tGroup(g.labelKey)}
              </div>
              <ul className="space-y-0.5 border-l-2 border-slate-200 pl-3 dark:border-zinc-700">
                {g.links.map(({ href, labelKey }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      prefetch={false}
                      onClick={onClose}
                      className={`btn-motion block rounded-md py-1.5 pl-2 text-sm hover:bg-slate-100 dark:hover:bg-zinc-800 ${
                        g.id === "legal"
                          ? "font-medium text-amber-900 dark:text-amber-200"
                          : "text-slate-800 dark:text-zinc-200"
                      }`}
                    >
                      {tNav(labelKey)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
}

function NavInner() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const tc = useTranslations("common");

  return (
    <>
      <SidebarDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur dark:border-zinc-800/80 dark:bg-zinc-950/90">
        <LegalStrip />
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="btn-motion group inline-flex items-center gap-2 rounded-xl border border-indigo-300 bg-gradient-to-r from-indigo-500 to-violet-500 px-3 py-2 text-sm font-semibold text-white shadow-md shadow-indigo-500/30 hover:from-indigo-400 hover:to-violet-400 dark:border-indigo-700 dark:shadow-indigo-900/30"
              aria-expanded={drawerOpen}
            >
              <svg
                className="h-5 w-5 transition-transform duration-200 group-hover:rotate-3"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden
              >
                <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
              </svg>
              <span className="hidden h-2 w-2 rounded-full bg-white/90 shadow-[0_0_10px_rgba(255,255,255,0.9)] sm:inline-block" />
              <span className="hidden sm:inline">{tc("menu")}</span>
            </button>
            <Link
              href="/"
              prefetch={false}
              className="text-lg font-semibold tracking-tight text-slate-900 dark:text-white"
            >
              PracticalKit
            </Link>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <ThemeToggle />
            <LangSwitch />
          </div>
        </div>
      </header>
    </>
  );
}

export function SiteChrome({
  locale,
  messages,
  children,
}: {
  locale: string;
  messages: Messages;
  children: ReactNode;
}) {
  return (
    <NextIntlClientProvider locale={locale} messages={messages} timeZone="UTC">
      <NavInner />
      <div className="mx-auto max-w-6xl px-4 py-8">{children}</div>
      <CookieAndAnalytics />
    </NextIntlClientProvider>
  );
}
