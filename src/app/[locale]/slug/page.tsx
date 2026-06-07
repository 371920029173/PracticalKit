"use client";

import { ToolPageShell } from "@/components/ToolPageShell";
import { ToolRunActions } from "@/components/ToolRunActions";
import { useTranslations } from "next-intl";
import { useCallback, useState } from "react";

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

  const run = useCallback(() => {
    setOut(slugify(input));
  }, [input]);

  const resetAndRun = useCallback(() => {
    const sample = t("sampleInput");
    setInput(sample);
    setOut(slugify(sample));
  }, [t]);

  return (
    <ToolPageShell title={t("title")} note={t("note")}>
      <textarea
        className="tool-textarea min-h-24"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={t("input")}
      />
      <ToolRunActions onRun={run} onResetAndRun={resetAndRun} />
      <div>
        <label className="tool-muted">{t("output")}</label>
        <div className="mt-1 flex flex-wrap gap-2">
          <code className="tool-pre-out block flex-1 font-mono text-sm">
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
    </ToolPageShell>
  );
}
