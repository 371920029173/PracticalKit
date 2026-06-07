"use client";

import { Link } from "@/i18n/navigation";
import { readRecentTools, subscribeRecentTools } from "@/lib/recent-tools";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState } from "react";

export function HeaderRecents() {
  const t = useTranslations("home");
  const nav = useTranslations("nav");
  const [items, setItems] = useState(readRecentTools);
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  const refresh = useCallback(() => setItems(readRecentTools()), []);
  useEffect(() => subscribeRecentTools(refresh), [refresh]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  if (items.length === 0) return null;

  return (
    <div ref={wrapRef} className="relative hidden sm:block">
      <button
        type="button"
        className="btn-ghost text-xs"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        {t("headerRecents")}
      </button>
      {open ? (
        <div className="glass-panel absolute right-0 top-full z-50 mt-2 w-56 rounded-xl p-3 shadow-xl">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-slate-500 dark:text-zinc-500">
            {t("recentTitle")}
          </p>
          <ul className="space-y-1">
            {items.slice(0, 6).map((e) => (
              <li key={e.segment}>
                <Link
                  href={`/${e.segment}/`}
                  prefetch={false}
                  className="block rounded-lg px-2 py-1.5 text-sm font-medium text-slate-800 hover:bg-indigo-50 dark:text-zinc-200 dark:hover:bg-indigo-950/40"
                  onClick={() => setOpen(false)}
                >
                  {e.pinned ? "📌 " : ""}
                  {nav(e.navKey as never)}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
