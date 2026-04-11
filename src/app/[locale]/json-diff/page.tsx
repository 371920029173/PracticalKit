"use client";

import { ToolRunActions } from "@/components/ToolRunActions";
import { diffLines } from "diff";
import { useTranslations } from "next-intl";
import { useCallback, useState } from "react";

function sortKeysDeep(obj: unknown): unknown {
  if (obj === null || typeof obj !== "object") return obj;
  if (Array.isArray(obj)) return obj.map(sortKeysDeep);
  const o = obj as Record<string, unknown>;
  const out: Record<string, unknown> = {};
  for (const k of Object.keys(o).sort()) {
    out[k] = sortKeysDeep(o[k]);
  }
  return out;
}

const DEF_A = '{\n  "a": 1\n}';
const DEF_B = '{\n  "a": 2\n}';

export default function JsonDiffPage() {
  const t = useTranslations("jsonDiffPage");
  const [a, setA] = useState(DEF_A);
  const [b, setB] = useState(DEF_B);
  const [out, setOut] = useState("");
  const [err, setErr] = useState("");

  const run = useCallback(() => {
    setErr("");
    setOut("");
    try {
      const ja = JSON.parse(a) as unknown;
      const jb = JSON.parse(b) as unknown;
      const sa = JSON.stringify(sortKeysDeep(ja), null, 2);
      const sb = JSON.stringify(sortKeysDeep(jb), null, 2);
      const parts = diffLines(sa, sb);
      const lines: string[] = [];
      for (const p of parts) {
        const prefix = p.added ? "+ " : p.removed ? "- " : "  ";
        const chunk = p.value.replace(/\n$/, "");
        for (const line of chunk.split("\n")) {
          lines.push(prefix + line);
        }
      }
      setOut(lines.join("\n"));
    } catch {
      setErr(t("parseErr"));
    }
  }, [a, b, t]);

  const resetAndRun = useCallback(() => {
    setA(DEF_A);
    setB(DEF_B);
    setErr("");
    setOut("");
    queueMicrotask(() => {
      try {
        const ja = JSON.parse(DEF_A) as unknown;
        const jb = JSON.parse(DEF_B) as unknown;
        const sa = JSON.stringify(sortKeysDeep(ja), null, 2);
        const sb = JSON.stringify(sortKeysDeep(jb), null, 2);
        const parts = diffLines(sa, sb);
        const lines: string[] = [];
        for (const p of parts) {
          const prefix = p.added ? "+ " : p.removed ? "- " : "  ";
          const chunk = p.value.replace(/\n$/, "");
          for (const line of chunk.split("\n")) {
            lines.push(prefix + line);
          }
        }
        setOut(lines.join("\n"));
      } catch {
        setErr(t("parseErr"));
      }
    });
  }, [t]);

  return (
    <div className="space-y-4">
      <h1 className="tool-h1">{t("title")}</h1>
      <p className="tool-muted">{t("note")}</p>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="tool-muted">{t("a")}</label>
          <textarea
            className="tool-textarea mt-1 min-h-48 text-xs"
            value={a}
            onChange={(e) => setA(e.target.value)}
          />
        </div>
        <div>
          <label className="tool-muted">{t("b")}</label>
          <textarea
            className="tool-textarea mt-1 min-h-48 text-xs"
            value={b}
            onChange={(e) => setB(e.target.value)}
          />
        </div>
      </div>
      <ToolRunActions onRun={run} onResetAndRun={resetAndRun} runLabel={t("run")} />
      {err && (
        <p className="text-sm text-red-600 dark:text-red-400">{err}</p>
      )}
      <pre className="tool-pre max-h-96 text-xs">{out || "—"}</pre>
    </div>
  );
}
