"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

function slugify(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function SlugPage() {
  const t = useTranslations("slugPage");
  const tc = useTranslations("common");
  const [input, setInput] = useState("");
  const [out, setOut] = useState("");

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
        {t("title")}
      </h1>
      <p className="text-sm text-slate-600 dark:text-zinc-400">{t("note")}</p>
      <textarea
        className="min-h-24 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-950"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={t("input")}
      />
      <button
        type="button"
        className="btn-primary"
        onClick={() => setOut(slugify(input))}
      >
        {t("run")}
      </button>
      <div>
        <label className="text-sm text-slate-600 dark:text-zinc-400">
          {t("output")}
        </label>
        <div className="mt-1 flex flex-wrap gap-2">
          <code className="block flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-sm dark:border-zinc-800 dark:bg-zinc-900">
            {out || "—"}
          </code>
          <button
            type="button"
            className="btn-ghost text-sm"
            onClick={() => {
              if (out) void navigator.clipboard.writeText(out);
            }}
          >
            {tc("copy")}
          </button>
        </div>
      </div>
    </div>
  );
}
