"use client";

import { ToolRunActions } from "@/components/ToolRunActions";
import { useTranslations } from "next-intl";
import { useCallback, useState } from "react";

const SENT =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.";

function words(n: number): string {
  const pool = SENT.split(/\s+/);
  const out: string[] = [];
  for (let i = 0; i < n; i++) out.push(pool[i % pool.length]!);
  return out.join(" ");
}

const DEF_PARAS = 3;
const DEF_WPP = 40;

function build(paras: number, wpp: number): string {
  const p: string[] = [];
  for (let i = 0; i < paras; i++) {
    p.push(words(wpp));
  }
  return p.join("\n\n");
}

export default function LoremPage() {
  const t = useTranslations("loremPage");
  const tc = useTranslations("common");
  const [paragraphs, setParagraphs] = useState(DEF_PARAS);
  const [wpp, setWpp] = useState(DEF_WPP);
  const [out, setOut] = useState("");

  const run = useCallback(() => {
    setOut(build(paragraphs, wpp));
  }, [paragraphs, wpp]);

  const resetAndRun = useCallback(() => {
    setParagraphs(DEF_PARAS);
    setWpp(DEF_WPP);
    setOut(build(DEF_PARAS, DEF_WPP));
  }, []);

  return (
    <div className="space-y-4">
      <h1 className="tool-h1">{t("title")}</h1>
      <p className="tool-muted">{t("note")}</p>
      <div className="flex flex-wrap gap-4">
        <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-zinc-300">
          {t("paragraphs")}
          <input
            type="number"
            min={1}
            max={50}
            value={paragraphs}
            onChange={(e) => setParagraphs(Number(e.target.value))}
            className="tool-field w-20"
          />
        </label>
        <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-zinc-300">
          {t("words")}
          <input
            type="number"
            min={5}
            max={200}
            value={wpp}
            onChange={(e) => setWpp(Number(e.target.value))}
            className="tool-field w-20"
          />
        </label>
      </div>
      <ToolRunActions onRun={run} onResetAndRun={resetAndRun} runLabel={t("run")} />
      <div className="flex flex-wrap gap-2">
        <textarea
          readOnly
          className="tool-textarea min-h-48 flex-1 bg-slate-50 dark:bg-zinc-900/50"
          value={out}
          aria-label={t("title")}
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
