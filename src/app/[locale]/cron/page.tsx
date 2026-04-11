"use client";

import { ToolRunActions } from "@/components/ToolRunActions";
import { useTranslations } from "next-intl";
import { useCallback, useState } from "react";

function validField(v: string, min: number, max: number): boolean {
  if (v === "*") return true;
  return v.split(",").every((part) => {
    if (/^\d+$/.test(part)) {
      const n = Number(part);
      return n >= min && n <= max;
    }
    if (/^\*\/\d+$/.test(part)) {
      const step = Number(part.slice(2));
      return step > 0;
    }
    if (/^\d+-\d+(\/\d+)?$/.test(part)) {
      const [range] = part.split("/");
      const [a, b] = range!.split("-").map(Number);
      return a >= min && b <= max && a <= b;
    }
    return false;
  });
}

const DEF_EXPR = "*/5 * * * *";

type CronRow = { k: string; v: string };

function parseCron(
  expr: string,
  t: (k: string) => string
): { err: string | null; rows: CronRow[] } {
  const parts = expr.trim().split(/\s+/);
  if (parts.length !== 5) return { err: t("invalid"), rows: [] };
  const [mi, ho, dm, mo, dw] = parts;
  if (
    !validField(mi!, 0, 59) ||
    !validField(ho!, 0, 23) ||
    !validField(dm!, 1, 31) ||
    !validField(mo!, 1, 12) ||
    !validField(dw!, 0, 7)
  ) {
    return { err: t("invalid"), rows: [] };
  }
  return {
    err: null,
    rows: [
      { k: t("min"), v: mi! },
      { k: t("hour"), v: ho! },
      { k: t("dom"), v: dm! },
      { k: t("mon"), v: mo! },
      { k: t("dow"), v: dw! },
    ],
  };
}

export default function CronPage() {
  const t = useTranslations("cronPage");
  const [expr, setExpr] = useState(DEF_EXPR);
  const [err, setErr] = useState("");
  const [rows, setRows] = useState<{ k: string; v: string }[]>([]);

  const run = useCallback(() => {
    const r = parseCron(expr, t);
    setErr(r.err ?? "");
    setRows(r.rows);
  }, [expr, t]);

  const resetAndRun = useCallback(() => {
    setExpr(DEF_EXPR);
    const r = parseCron(DEF_EXPR, t);
    setErr(r.err ?? "");
    setRows(r.rows);
  }, [t]);

  return (
    <div className="space-y-4">
      <h1 className="tool-h1">{t("title")}</h1>
      <p className="tool-muted">{t("note")}</p>
      <input
        value={expr}
        onChange={(e) => setExpr(e.target.value)}
        className="tool-field w-full font-mono"
        placeholder={t("expr")}
      />
      <ToolRunActions onRun={run} onResetAndRun={resetAndRun} runLabel={t("run")} />
      {err && (
        <p className="text-sm text-red-600 dark:text-red-400">{err}</p>
      )}
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-zinc-800 dark:bg-zinc-900">
        <p className="mb-2 text-sm font-semibold text-slate-700 dark:text-zinc-200">
          {t("explain")}
        </p>
        {rows.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-zinc-500">—</p>
        ) : (
          <ul className="space-y-1 text-sm text-slate-800 dark:text-zinc-200">
            {rows.map((r) => (
              <li key={r.k}>
                <span className="font-medium">{r.k}:</span>{" "}
                <code className="rounded bg-white px-1 dark:bg-zinc-950">{r.v}</code>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
