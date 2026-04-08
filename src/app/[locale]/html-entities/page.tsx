"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

function encodeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function decodeHtml(s: string): string {
  if (typeof document === "undefined") return s;
  const ta = document.createElement("textarea");
  ta.innerHTML = s;
  return ta.value;
}

export default function HtmlEntitiesPage() {
  const t = useTranslations("htmlEntitiesPage");
  const [text, setText] = useState("");
  const [out, setOut] = useState("");

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
        {t("title")}
      </h1>
      <p className="text-sm text-slate-600 dark:text-zinc-400">{t("note")}</p>
      <textarea
        className="min-h-32 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono text-sm dark:border-zinc-600 dark:bg-zinc-950"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={t("input")}
      />
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className="btn-primary"
          onClick={() => setOut(encodeHtml(text))}
        >
          {t("encode")}
        </button>
        <button
          type="button"
          className="btn-ghost"
          onClick={() => setOut(decodeHtml(text))}
        >
          {t("decode")}
        </button>
      </div>
      <pre className="min-h-24 w-full rounded-lg border border-slate-200 bg-slate-50 p-3 font-mono text-sm dark:border-zinc-800 dark:bg-zinc-900">
        {out || "—"}
      </pre>
      <p className="text-xs text-slate-500">{t("output")}</p>
    </div>
  );
}
