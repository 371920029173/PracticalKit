"use client";

import { ToolRunActions } from "@/components/ToolRunActions";
import { useTranslations } from "next-intl";
import { useCallback, useState } from "react";

function minifyCss(css: string): string {
  return css
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\s*([{}:;,>+~])\s*/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

const DEF_CSS = `.hero {
  color: #1e293b;
  padding: 1rem 2rem;
}
`;

export default function CssMinPage() {
  const t = useTranslations("cssMinPage");
  const tc = useTranslations("common");
  const [input, setInput] = useState(DEF_CSS);
  const [out, setOut] = useState("");

  const run = useCallback(() => {
    setOut(minifyCss(input));
  }, [input]);

  const resetAndRun = useCallback(() => {
    setInput(DEF_CSS);
    setOut(minifyCss(DEF_CSS));
  }, []);

  return (
    <div className="space-y-4">
      <h1 className="tool-h1">{t("title")}</h1>
      <p className="tool-muted">{t("note")}</p>
      <textarea
        className="tool-textarea min-h-48"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={t("input")}
      />
      <ToolRunActions onRun={run} onResetAndRun={resetAndRun} />
      <div className="flex flex-wrap items-start gap-2">
        <pre className="tool-pre min-h-24 flex-1 text-xs">{out || "—"}</pre>
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
      <p className="text-xs text-slate-500 dark:text-zinc-500">{t("output")}</p>
    </div>
  );
}
