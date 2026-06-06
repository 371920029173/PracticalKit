"use client";

import { Link } from "@/i18n/navigation";
import {
  TOOLS,
  type ToolCategory,
  type ToolDef,
} from "@/lib/tools-registry";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const CATEGORIES: (ToolCategory | "all")[] = [
  "all",
  "documents",
  "media",
  "dataDev",
  "daily",
  "math",
  "network",
  "fun",
  "extras",
];

type ToolFinderProps = {
  /** Initial query from ?q= for Google Sitelinks search box */
  initialQuery?: string;
  /** Compact mode: only the filter bar (homepage). Full: includes modal trigger in header. */
  variant?: "bar" | "header";
};

function normalize(s: string): string {
  return s.toLowerCase().replace(/\s+/g, " ").trim();
}

function scoreTool(
  tool: ToolDef,
  q: string,
  title: string,
  blurb: string,
): number {
  if (!q) return 1;
  const hay = normalize(`${title} ${blurb} ${tool.segment} ${tool.keywords?.join(" ") ?? ""}`);
  const terms = q.split(/\s+/).filter(Boolean);
  let score = 0;
  for (const term of terms) {
    if (hay.includes(term)) score += 10;
    if (title.toLowerCase().includes(term)) score += 20;
    if (tool.segment.includes(term)) score += 15;
  }
  return score;
}

export function ToolFinder({
  initialQuery = "",
  variant = "bar",
}: ToolFinderProps) {
  const t = useTranslations("toolFinder");
  const nav = useTranslations("nav");
  const home = useTranslations("home");
  const tGroup = useTranslations("navGroup");

  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState<ToolCategory | "all">("all");
  const [modalOpen, setModalOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialQuery) setQuery(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const q = new URLSearchParams(window.location.search).get("q");
    if (q) setQuery(q);
  }, []);

  useEffect(() => {
    if (!modalOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setModalOpen(false);
    };
    window.addEventListener("keydown", onKey);
    inputRef.current?.focus();
    return () => window.removeEventListener("keydown", onKey);
  }, [modalOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setModalOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const results = useMemo(() => {
    const q = normalize(query);
    return TOOLS.map((tool) => {
      const title = nav(tool.navKey);
      const blurb = home(`toolBlurbs.${tool.navKey}` as "toolBlurbs.pdf");
      const score = scoreTool(tool, q, title, blurb);
      return { tool, title, blurb, score };
    })
      .filter(({ tool, score }) => {
        if (category !== "all" && tool.category !== category) return false;
        if (!q) return true;
        return score > 0;
      })
      .sort((a, b) => b.score - a.score);
  }, [query, category, nav, home]);

  const openModal = useCallback(() => setModalOpen(true), []);

  const filterBar = (
    <div className="space-y-4 animate-fade-up">
      <div className="relative">
        <input
          ref={variant === "header" ? undefined : inputRef}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("placeholder")}
          className="tool-field w-full pl-10 pr-4"
          aria-label={t("placeholder")}
        />
        <svg
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden
        >
          <circle cx="11" cy="11" r="7" />
          <path d="M20 20l-3-3" strokeLinecap="round" />
        </svg>
        <span className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded border border-slate-200 px-1.5 py-0.5 text-[10px] text-slate-400 sm:inline dark:border-zinc-700">
          Ctrl+K
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setCategory(cat)}
            className={`tool-chip ${category === cat ? "tool-chip-on" : "tool-chip-off"}`}
          >
            {cat === "all" ? t("allCategories") : tGroup(cat as ToolCategory)}
          </button>
        ))}
      </div>
      <p className="text-xs text-slate-500 dark:text-zinc-500">
        {t("resultCount", { count: results.length })}
      </p>
    </div>
  );

  const resultList = (
    <ul className="stagger-fade mt-4 max-h-[min(24rem,50vh)] space-y-2 overflow-y-auto pr-1">
      {results.length === 0 ? (
        <li className="rounded-xl border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-500 dark:border-zinc-700 dark:text-zinc-400">
          {t("noResults")}
        </li>
      ) : (
        results.map(({ tool, title, blurb }) => (
          <li key={tool.segment}>
            <Link
              href={`/${tool.segment}/`}
              prefetch={false}
              onClick={() => setModalOpen(false)}
              className="btn-motion flex flex-col gap-1 rounded-xl border border-slate-200/80 bg-white/80 px-4 py-3 hover:border-indigo-300 hover:bg-indigo-50/80 dark:border-zinc-700 dark:bg-zinc-900/60 dark:hover:border-indigo-700 dark:hover:bg-indigo-950/40"
            >
              <span className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white">
                {title}
                {tool.isNew ? (
                  <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
                    {t("newBadge")}
                  </span>
                ) : null}
              </span>
              <span className="text-sm text-slate-600 dark:text-zinc-400">{blurb}</span>
            </Link>
          </li>
        ))
      )}
    </ul>
  );

  if (variant === "header") {
    return (
      <>
        <button
          type="button"
          onClick={openModal}
          className="btn-ghost hidden items-center gap-2 text-xs sm:inline-flex"
          aria-haspopup="dialog"
          aria-expanded={modalOpen}
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-3-3" strokeLinecap="round" />
          </svg>
          {t("openSearch")}
        </button>
        {modalOpen ? (
          <div
            className="fixed inset-0 z-[60] flex items-start justify-center bg-black/50 p-4 pt-[12vh] backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-label={t("dialogTitle")}
            onClick={() => setModalOpen(false)}
          >
            <div
              className="glass-panel animate-scale-in w-full max-w-lg rounded-2xl p-5 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">{t("dialogTitle")}</h2>
                <button type="button" className="btn-ghost text-xs" onClick={() => setModalOpen(false)}>
                  {t("close")}
                </button>
              </div>
              <input
                ref={inputRef}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t("placeholder")}
                className="tool-field w-full"
                aria-label={t("placeholder")}
              />
              <div className="mt-3 flex flex-wrap gap-2">
                {CATEGORIES.slice(0, 6).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`tool-chip text-xs ${category === cat ? "tool-chip-on" : "tool-chip-off"}`}
                  >
                    {cat === "all" ? t("allCategories") : tGroup(cat as ToolCategory)}
                  </button>
                ))}
              </div>
              {resultList}
            </div>
          </div>
        ) : null}
      </>
    );
  }

  return (
    <div className="glass-panel rounded-2xl p-5 sm:p-6">
      {filterBar}
      {resultList}
    </div>
  );
}
