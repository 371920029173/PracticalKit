"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

const SENT = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.";

function words(n: number): string {
  const pool = SENT.split(/\s+/);
  const out: string[] = [];
  for (let i = 0; i < n; i++) out.push(pool[i % pool.length]!);
  return out.join(" ");
}

export default function LoremPage() {
  const t = useTranslations("loremPage");
  const tc = useTranslations("common");
  const [paragraphs, setParagraphs] = useState(3);
  const [wpp, setWpp] = useState(40);
  const [out, setOut] = useState("");

  function run() {
    const paras: string[] = [];
    for (let p = 0; p < paragraphs; p++) {
      paras.push(words(wpp));
    }
    setOut(paras.join("\n\n"));
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
        {t("title")}
      </h1>
      <p className="text-sm text-slate-600 dark:text-zinc-400">{t("note")}</p>
      <div className="flex flex-wrap gap-4">
        <label className="flex items-center gap-2 text-sm">
          {t("paragraphs")}
          <input
            type="number"
            min={1}
            max={50}
            value={paragraphs}
            onChange={(e) => setParagraphs(Number(e.target.value))}
            className="w-20 rounded border border-slate-300 px-2 py-1 dark:border-zinc-600 dark:bg-zinc-900"
          />
        </label>
        <label className="flex items-center gap-2 text-sm">
          {t("words")}
          <input
            type="number"
            min={5}
            max={200}
            value={wpp}
            onChange={(e) => setWpp(Number(e.target.value))}
            className="w-20 rounded border border-slate-300 px-2 py-1 dark:border-zinc-600 dark:bg-zinc-900"
          />
        </label>
      </div>
      <button type="button" className="btn-primary" onClick={run}>
        {t("run")}
      </button>
      <div className="flex flex-wrap gap-2">
        <textarea
          readOnly
          className="min-h-48 flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-900"
          value={out}
        />
        <button
          type="button"
          className="btn-ghost self-start text-sm"
          onClick={() => {
            if (out) void navigator.clipboard.writeText(out);
          }}
        >
          {tc("copy")}
        </button>
      </div>
    </div>
  );
}
