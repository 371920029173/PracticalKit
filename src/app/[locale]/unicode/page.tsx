"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

function inspect(s: string): string {
  const lines: string[] = [];
  for (const ch of s) {
    const cp = ch.codePointAt(0)!;
    const hex = cp.toString(16).toUpperCase().padStart(4, "0");
    lines.push(`U+${hex}\t${ch}`);
  }
  return lines.join("\n");
}

export default function UnicodePage() {
  const t = useTranslations("unicodePage");
  const [text, setText] = useState("Hello 你好 🎉");
  const [out, setOut] = useState("");

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
        {t("title")}
      </h1>
      <p className="text-sm text-slate-600 dark:text-zinc-400">{t("note")}</p>
      <textarea
        className="min-h-24 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-950"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={t("input")}
      />
      <button
        type="button"
        className="btn-primary"
        onClick={() => setOut(inspect(text))}
      >
        {t("run")}
      </button>
      <pre className="min-h-48 w-full overflow-auto rounded-lg border border-slate-200 bg-slate-50 p-3 font-mono text-sm dark:border-zinc-800 dark:bg-zinc-900">
        {out || "—"}
      </pre>
    </div>
  );
}
