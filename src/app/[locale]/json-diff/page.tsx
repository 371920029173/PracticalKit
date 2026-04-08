"use client";

import { diffLines } from "diff";
import { useState } from "react";
import { useTranslations } from "next-intl";

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

export default function JsonDiffPage() {
  const t = useTranslations("jsonDiffPage");
  const [a, setA] = useState('{\n  "a": 1\n}');
  const [b, setB] = useState('{\n  "a": 2\n}');
  const [out, setOut] = useState("");
  const [err, setErr] = useState("");

  function run() {
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
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
        {t("title")}
      </h1>
      <p className="text-sm text-slate-600 dark:text-zinc-400">{t("note")}</p>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="text-sm text-slate-600 dark:text-zinc-400">
            {t("a")}
          </label>
          <textarea
            className="mt-1 min-h-48 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono text-xs dark:border-zinc-600 dark:bg-zinc-950"
            value={a}
            onChange={(e) => setA(e.target.value)}
          />
        </div>
        <div>
          <label className="text-sm text-slate-600 dark:text-zinc-400">
            {t("b")}
          </label>
          <textarea
            className="mt-1 min-h-48 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono text-xs dark:border-zinc-600 dark:bg-zinc-950"
            value={b}
            onChange={(e) => setB(e.target.value)}
          />
        </div>
      </div>
      <button type="button" className="btn-primary" onClick={run}>
        {t("run")}
      </button>
      {err && <p className="text-sm text-red-600">{err}</p>}
      <pre className="max-h-96 overflow-auto rounded-lg border border-slate-200 bg-slate-50 p-3 font-mono text-xs text-slate-800 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200">
        {out || "—"}
      </pre>
    </div>
  );
}
