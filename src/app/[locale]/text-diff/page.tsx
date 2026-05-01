"use client";

import { ToolRunActions } from "@/components/ToolRunActions";
import { diffLines, diffWords } from "diff";
import { useTranslations } from "next-intl";
import { useCallback, useMemo, useState } from "react";

export default function TextDiffPage() {
  const t = useTranslations("textDiffPage");
  const [left, setLeft] = useState("");
  const [right, setRight] = useState("");
  const [mode, setMode] = useState<"line" | "word">("line");
  const [segments, setSegments] = useState<Array<{ value: string; add?: boolean; rem?: boolean }>>([]);

  const run = useCallback(() => {
    const source = mode === "line" ? diffLines(left, right) : diffWords(left, right);
    setSegments(source.map((s) => ({ value: s.value, add: s.added, rem: s.removed })));
  }, [left, mode, right]);

  const resetAndRun = useCallback(() => {
    const a = "alpha\nbeta\nrelease-1";
    const b = "alpha\nbeta-updated\nrelease-2\nstable";
    setLeft(a);
    setRight(b);
    setMode("line");
    const source = diffLines(a, b);
    setSegments(source.map((s) => ({ value: s.value, add: s.added, rem: s.removed })));
  }, []);

  const stats = useMemo(() => {
    const added = segments.filter((s) => s.add).length;
    const removed = segments.filter((s) => s.rem).length;
    return { added, removed };
  }, [segments]);

  return (
    <div className="space-y-4">
      <h1 className="tool-h1">{t("title")}</h1>
      <p className="tool-muted">{t("note")}</p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          className={`tool-chip ${mode === "line" ? "tool-chip-on" : "tool-chip-off"}`}
          onClick={() => setMode("line")}
        >
          {t("line")}
        </button>
        <button
          type="button"
          className={`tool-chip ${mode === "word" ? "tool-chip-on" : "tool-chip-off"}`}
          onClick={() => setMode("word")}
        >
          {t("word")}
        </button>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <textarea className="tool-textarea min-h-40" value={left} onChange={(e) => setLeft(e.target.value)} placeholder={t("left")} />
        <textarea className="tool-textarea min-h-40" value={right} onChange={(e) => setRight(e.target.value)} placeholder={t("right")} />
      </div>
      <ToolRunActions onRun={run} onResetAndRun={resetAndRun} />
      <p className="tool-muted">
        {t("summary", { added: stats.added, removed: stats.removed })}
      </p>
      <pre className="tool-pre max-h-[28rem] whitespace-pre-wrap">
        {segments.length === 0
          ? "—"
          : segments.map((s, idx) => (
              <span
                key={idx}
                className={
                  s.add
                    ? "bg-emerald-500/20 text-emerald-900 dark:text-emerald-200"
                    : s.rem
                      ? "bg-rose-500/20 text-rose-900 line-through dark:text-rose-200"
                      : ""
                }
              >
                {s.value}
              </span>
            ))}
      </pre>
    </div>
  );
}
