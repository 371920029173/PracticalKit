"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

function minifyCss(css: string): string {
  return css
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\s*([{}:;,>+~])\s*/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

export default function CssMinPage() {
  const t = useTranslations("cssMinPage");
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
        className="min-h-48 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono text-sm dark:border-zinc-600 dark:bg-zinc-950"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={t("input")}
      />
      <button
        type="button"
        className="btn-primary"
        onClick={() => setOut(minifyCss(input))}
      >
        {t("run")}
      </button>
      <div className="flex flex-wrap items-start gap-2">
        <pre className="min-h-24 flex-1 overflow-auto rounded-lg border border-slate-200 bg-slate-50 p-3 font-mono text-xs dark:border-zinc-800 dark:bg-zinc-900">
          {out || "—"}
        </pre>
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
      <p className="text-xs text-slate-500">{t("output")}</p>
    </div>
  );
}
